import { getClientMembership, requireSdkStaff } from "@/lib/auth/authorization";
import { forbidden } from "@/lib/users/shared";
import { getPrisma } from "@/lib/db";
import type { AppPrincipal, ProviderPrincipal } from "@/types";
import type { OpportunityInvitation } from "@/generated/prisma/client";

type InvitationWithOpportunity = OpportunityInvitation & {
  opportunity: { id: string; title: string; companyId: string };
};

export async function loadOwnedInvitation(
  principal: ProviderPrincipal,
  invitationId: string
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

export async function getOpportunityInvitation(
  principal: AppPrincipal,
  invitationId: string
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
