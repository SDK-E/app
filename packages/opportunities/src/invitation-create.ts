import { getClientMembership, requireSdkStaff } from "@sdk-e/auth/authorization";
import { forbidden } from "@sdk-e/users/shared";
import { getPrisma } from "@sdk-e/db";
import { emitNotification } from "@sdk-e/opportunities/invitations";
import type { AppPrincipal } from "@sdk-e/types";

const DEFAULT_TTL_DAYS = 7;

function ttlMs(ttlDays: number): number {
  return ttlDays * 24 * 60 * 60 * 1000;
}

async function authorizeInvitationCreator(principal: AppPrincipal, companyId: string) {
  if (principal.kind === "sdk-staff") {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
    return;
  }
  if (principal.kind === "client") {
    const membership = getClientMembership(principal, companyId);
    if (membership.role !== "OWNER" && membership.role !== "ADMINISTRATOR") {
      forbidden("Only a company owner or administrator can invite providers.");
    }
    return;
  }
  forbidden("Only SDK staff or client owners can invite providers.");
}

export async function createOpportunityInvitation(
  principal: AppPrincipal,
  opportunityId: string,
  providerId: string,
  ttlDays: number = DEFAULT_TTL_DAYS
) {
  const opportunity = await getPrisma().opportunity.findFirst({
    where: { id: opportunityId },
    select: { id: true, companyId: true, title: true },
  });
  if (!opportunity) forbidden("Opportunity not found.");

  authorizeInvitationCreator(principal, opportunity.companyId);

  const existing = await getPrisma().opportunityInvitation.findFirst({
    where: {
      opportunityId,
      providerId,
      status: { in: ["PENDING", "ACCEPTED"] },
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) return existing;

  const provider = await getPrisma().provider.findFirst({
    where: { id: providerId },
    include: { user: true },
  });
  if (!provider) forbidden("Provider not found.");
  if (!provider.user) {
    forbidden("Provider has no associated user account to receive an invitation.");
  }

  const now = new Date();
  const invitation = await getPrisma().opportunityInvitation.create({
    data: {
      opportunityId,
      companyId: opportunity.companyId,
      providerId,
      invitedById: principal.id,
      status: "PENDING",
      expiresAt: new Date(now.getTime() + ttlMs(ttlDays)),
    },
  });

  await emitNotification({
    recipientId: provider.user.id,
    recipientKind: "PROVIDER",
    category: "INVITATION",
    type: "OPPORTUNITY_INVITATION_SENT",
    title: `Invitation to ${opportunity.title}`,
    eventKey: `opportunity-invitation:sent:${invitation.id}`,
    data: {
      to: provider.user.email,
      providerName: provider.user.name,
      opportunityTitle: opportunity.title,
      acceptUrl: `/app/opportunities/invitations/${invitation.id}`,
      expiresAt: invitation.expiresAt.toISOString(),
    },
  });

  return invitation;
}
