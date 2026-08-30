import type { OpportunityInvitation, OpportunityInvitationStatus } from "@platform/db/client";
import type { AppPrincipal } from "@platform/types";

import { requireProviderPrincipal } from "@platform/auth/authorization";
import { defineStateMachine } from "@platform/core/state-machine";
import { getPrisma } from "@platform/db";
import { loadOwnedInvitation } from "@platform/opportunities/invitation-access";
import { emitNotification } from "@platform/opportunities/invitation-create";
import { type OpportunityPublicRecord, selectOpportunitySafe } from "@platform/opportunities/safe";
import { forbidden } from "@platform/users/shared";

export interface ProviderInvitationView extends OpportunityInvitation {
  opportunity: OpportunityPublicRecord;
}

export { createOpportunityInvitation } from "@platform/opportunities/invitation-create";

export const opportunityInvitationMachine = defineStateMachine<OpportunityInvitationStatus>({
  initial: "PENDING",
  transitions: [
    { from: "PENDING", to: "ACCEPTED" },
    { from: "PENDING", to: "DECLINED" },
    { from: "PENDING", to: "EXPIRED" },
  ],
});

export async function acceptOpportunityInvitation(principal: AppPrincipal, invitationId: string) {
  const provider = requireProviderPrincipal(principal);
  const invitation = await loadOwnedInvitation(provider, invitationId);
  if (invitation.status !== "PENDING") {
    forbidden(`Invitation is already ${invitation.status.toLowerCase()}.`);
  }
  opportunityInvitationMachine.assertTransition("PENDING", "ACCEPTED");

  const updated = await getPrisma().opportunityInvitation.update({
    where: { id: invitationId },
    data: { status: "ACCEPTED", acceptedAt: new Date(), respondedAt: new Date() },
  });

  await emitNotification({
    recipientId: provider.id,
    recipientKind: "PROVIDER",
    category: "INVITATION",
    type: "OPPORTUNITY_INVITATION_ACCEPTED",
    title: `You accepted ${invitation.opportunity.title}`,
    eventKey: `opportunity-invitation:accepted:${invitation.id}`,
    data: { opportunityTitle: invitation.opportunity.title },
  });

  return updated;
}

export async function declineOpportunityInvitation(principal: AppPrincipal, invitationId: string) {
  const provider = requireProviderPrincipal(principal);
  const invitation = await loadOwnedInvitation(provider, invitationId);
  if (invitation.status !== "PENDING") {
    forbidden(`Invitation is already ${invitation.status.toLowerCase()}.`);
  }
  opportunityInvitationMachine.assertTransition("PENDING", "DECLINED");

  const updated = await getPrisma().opportunityInvitation.update({
    where: { id: invitationId },
    data: { status: "DECLINED", respondedAt: new Date() },
  });

  await emitNotification({
    recipientId: provider.id,
    recipientKind: "PROVIDER",
    category: "INVITATION",
    type: "OPPORTUNITY_INVITATION_DECLINED",
    title: `You declined ${invitation.opportunity.title}`,
    eventKey: `opportunity-invitation:declined:${invitation.id}`,
    data: { opportunityTitle: invitation.opportunity.title },
  });

  return updated;
}

export async function expireOpportunityInvitations(): Promise<number> {
  const now = new Date();
  const candidates = await getPrisma().opportunityInvitation.findMany({
    where: { status: "PENDING", expiresAt: { lt: now } },
    include: {
      opportunity: { select: { id: true, title: true } },
      provider: { include: { user: true } },
    },
  });
  if (candidates.length === 0) return 0;

  const candidateIds = candidates.map((c) => c.id);
  const result = await getPrisma().opportunityInvitation.updateMany({
    where: { id: { in: candidateIds }, status: "PENDING" },
    data: { status: "EXPIRED" },
  });

  for (const candidate of candidates) {
    await emitNotification({
      recipientId: candidate.providerId,
      recipientKind: "PROVIDER",
      category: "INVITATION",
      type: "OPPORTUNITY_INVITATION_EXPIRED",
      title: `Invitation to ${candidate.opportunity.title} expired`,
      eventKey: `opportunity-invitation:expired:${candidate.id}`,
      data: {
        to: candidate.provider.user?.email ?? "",
        providerName: candidate.provider.user?.name ?? "",
        opportunityTitle: candidate.opportunity.title,
      },
    });
  }

  return result.count;
}

export async function listProviderInvitations(
  principal: AppPrincipal,
): Promise<ProviderInvitationView[]> {
  const provider = requireProviderPrincipal(principal);
  const rows = await getPrisma().opportunityInvitation.findMany({
    where: { providerId: provider.providerId },
    orderBy: { createdAt: "desc" },
    include: { opportunity: true },
  });
  return rows.map((row) => ({
    ...row,
    opportunity: selectOpportunitySafe(provider, row.opportunity) as OpportunityPublicRecord,
  }));
}
