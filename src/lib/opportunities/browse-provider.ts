import { getPrisma } from "@/lib/db";
import { isProviderEligibleForOpportunity } from "@/lib/opportunities/eligibility-browse";
import { selectOpportunitySafe } from "@/lib/opportunities/safe";
import { Prisma } from "@/generated/prisma/client";
import type { OpportunityInvitation, OpportunityVisibilityMode } from "@/generated/prisma/client";
import type { ProviderPrincipal } from "@/types";
import type { ListOpportunitiesFilters } from "@/lib/opportunities/queries";

const BROWSE_VISIBILITY_MODES: OpportunityVisibilityMode[] = [
  "ELIGIBLE_NETWORK",
  "DIRECT",
  "INVITE_ONLY",
];

export async function listOpportunitiesForProvider(
  principal: ProviderPrincipal,
  filters: ListOpportunitiesFilters
) {
  const provider = await getPrisma().provider.findFirst({
    where: { id: principal.providerId },
    select: { id: true, companyId: true },
  });
  if (!provider || !provider.companyId) return [];

  const where: Prisma.OpportunityWhereInput = {
    companyId: provider.companyId,
    visibilityMode: { in: BROWSE_VISIBILITY_MODES },
  };
  if (filters.visibilityMode) where.visibilityMode = filters.visibilityMode;
  if (filters.status) where.status = filters.status;
  if (filters.skills?.length) where.requiredSkills = { hasSome: filters.skills };

  const opportunities = await getPrisma().opportunity.findMany({ where });

  const [invitations, preferences] = await Promise.all([
    getPrisma().opportunityInvitation.findMany({
      where: { providerId: principal.providerId },
    }),
    getPrisma().opportunityProviderPreference.findMany({
      where: { providerId: principal.providerId },
    }),
  ]);

  const hiddenIds = new Set(
    preferences.filter((p) => p.action === "HIDDEN").map((p) => p.opportunityId)
  );
  const savedIds = new Set(
    preferences.filter((p) => p.action === "SAVED").map((p) => p.opportunityId)
  );

  const invitationsByOpportunity = new Map<string, OpportunityInvitation[]>();
  for (const invitation of invitations) {
    const list = invitationsByOpportunity.get(invitation.opportunityId) ?? [];
    list.push(invitation);
    invitationsByOpportunity.set(invitation.opportunityId, list);
  }

  const now = new Date();
  const annotated = await Promise.all(
    opportunities.map(async (opportunity) => {
      if (hiddenIds.has(opportunity.id)) return null;

      const activeInvitation = invitationsByOpportunity
        .get(opportunity.id)
        ?.find(
          (invitation) =>
            (invitation.status === "PENDING" || invitation.status === "ACCEPTED") &&
            invitation.expiresAt > now
        );

      if (opportunity.visibilityMode === "ELIGIBLE_NETWORK") {
        const eligibility = await isProviderEligibleForOpportunity(
          principal.providerId,
          opportunity.id
        );
        if (!eligibility.eligible) return null;
      } else if (!activeInvitation) {
        return null;
      }

      const providerAction = savedIds.has(opportunity.id)
        ? "SAVED"
        : hiddenIds.has(opportunity.id)
          ? "HIDDEN"
          : null;

      return selectOpportunitySafe(principal, opportunity, providerAction);
    })
  );

  const visible = annotated.filter((record) => record !== null);

  const take = Math.min(Math.max(filters.take ?? 20, 1), 100);
  const skip = Math.max(filters.skip ?? 0, 0);
  return visible.slice(skip, skip + take);
}
