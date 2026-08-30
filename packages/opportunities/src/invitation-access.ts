import type { OpportunityInvitation } from "@platform/db/client";
import type { AppPrincipal, ProviderPrincipal } from "@platform/types";

import { getClientMembership, requireSdkStaff } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import { forbidden } from "@platform/users/shared";

type InvitationWithOpportunity = {
  opportunity: { id: string; title: string; companyId: string };
} & OpportunityInvitation;

export async function getOpportunityInvitation(
  principal: AppPrincipal,
  invitationId: string,
): Promise<InvitationWithOpportunity> {
  const invitation = await getPrisma().opportunityInvitation.findFirst({
    where: { id: invitationId },
    include: { opportunity: { select: { id: true, companyId: true, title: true } } },
  });
  if (!invitation) forbidden("Invitation not found.");

  if (principal.kind === "provider") {
    if (invitation.providerId !== principal.providerId) {
      forbidden("You do not have access to this invitation.");
    }
    return invitation;
  }
  if (principal.kind === "sdk-staff") {
    requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
    return invitation;
  }
  if (principal.kind === "client") {
    const membership = getClientMembership(principal, invitation.opportunity.companyId);
    if (membership.role !== "OWNER" && membership.role !== "ADMINISTRATOR") {
      forbidden("You do not have access to this invitation.");
    }
    return invitation;
  }
  forbidden("You do not have access to this invitation.");
}

export async function loadOwnedInvitation(
  principal: ProviderPrincipal,
  invitationId: string,
): Promise<InvitationWithOpportunity> {
  const invitation = await getPrisma().opportunityInvitation.findFirst({
    where: { id: invitationId },
    include: { opportunity: { select: { id: true, title: true, companyId: true } } },
  });
  if (!invitation) forbidden("Invitation not found.");
  if (invitation.providerId !== principal.providerId) {
    forbidden("You do not have access to this invitation.");
  }
  return invitation;
}
