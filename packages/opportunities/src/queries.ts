import { notFound, requireSdkStaff } from "@sdk-e/auth/authorization";
import { requireActiveCompany } from "@sdk-e/requests/guards";
import { getPrisma } from "@sdk-e/db";
import {
  canViewOpportunity,
  selectOpportunityPositionSafe,
  selectOpportunitySafe,
} from "@sdk-e/opportunities/safe";
import { Prisma } from "@sdk-e/db/client";
import type { OpportunityStatus, OpportunityVisibilityMode } from "@sdk-e/db/client";
import type { AppPrincipal } from "@sdk-e/types";
import { listOpportunitiesForProvider } from "@sdk-e/opportunities/browse-provider";

export interface ListOpportunitiesFilters {
  visibilityMode?: OpportunityVisibilityMode;
  status?: OpportunityStatus;
  skills?: string[];
  take?: number;
  skip?: number;
}

export async function listOpportunities(
  principal: AppPrincipal,
  companyId: string,
  filters: ListOpportunitiesFilters = {}
) {
  if (principal.kind === "provider") {
    return listOpportunitiesForProvider(principal, filters);
  }

  const isPrivileged =
    principal.kind === "sdk-staff" && (principal.role === "ADMIN" || principal.role === "DELIVERY");

  const where: Prisma.OpportunityWhereInput = { companyId };

  if (isPrivileged) {
    if (filters.visibilityMode) where.visibilityMode = filters.visibilityMode;
  } else if (principal.kind === "client") {
    where.visibilityMode = "ELIGIBLE_NETWORK";
  } else {
    return [];
  }

  if (filters.status) where.status = filters.status;
  if (filters.skills?.length) where.requiredSkills = { hasSome: filters.skills };

  const rows = await getPrisma().opportunity.findMany({ where });
  return rows.map((opportunity) => selectOpportunitySafe(principal, opportunity));
}

export async function getOpportunity(principal: AppPrincipal, companyId: string, id: string) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  const row = await getPrisma().opportunity.findFirst({ where: { id, companyId } });
  if (!row) notFound("Opportunity not found.");
  if (!canViewOpportunity(staff, row.visibilityMode)) {
    notFound("Opportunity not found.");
  }
  return selectOpportunitySafe(staff, row);
}

export async function getOpportunityPositions(
  principal: AppPrincipal,
  companyId: string,
  opportunityId: string
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  const parent = await getPrisma().opportunity.findFirst({
    where: { id: opportunityId, companyId },
  });
  if (!parent) notFound("Opportunity not found.");
  if (!canViewOpportunity(staff, parent.visibilityMode)) {
    notFound("Opportunity not found.");
  }
  const positions = await getPrisma().opportunityPosition.findMany({
    where: { opportunityId, companyId },
  });
  return positions.map((position) => selectOpportunityPositionSafe(staff, position));
}

export async function getOpportunityAttachments(
  principal: AppPrincipal,
  companyId: string,
  opportunityId: string
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  const parent = await getPrisma().opportunity.findFirst({
    where: { id: opportunityId, companyId },
  });
  if (!parent) notFound("Opportunity not found.");
  if (!canViewOpportunity(staff, parent.visibilityMode)) {
    notFound("Opportunity not found.");
  }
  const positions = await getPrisma().opportunityPosition.findMany({
    where: { opportunityId, companyId },
    select: { id: true },
  });
  const positionIds = positions.map((position) => position.id);
  return getPrisma().document.findMany({
    where: {
      companyId,
      OR: [
        { opportunityId },
        { opportunityPositionId: { in: positionIds.length ? positionIds : undefined } },
      ],
    },
  });
}
