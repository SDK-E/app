import type { OpportunityStatus, OpportunityVisibilityMode } from "@platform/db/client";
import type { AppPrincipal } from "@platform/types";

import { notFound, requireSdkStaff } from "@platform/auth/authorization";
import { createAuditEvent } from "@platform/core/audit";
import { getPrisma } from "@platform/db";
import { opportunityMachine } from "@platform/opportunities/machine";
import { opportunityActivity } from "@platform/opportunities/workflow/shared";
import { requireActiveCompany } from "@platform/requests/guards";

export async function setVisibilityMode(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  mode: OpportunityVisibilityMode,
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.opportunity.findFirst({ where: { id, companyId } });
    if (!current) notFound("Opportunity not found.");
    const opportunity = await tx.opportunity.update({
      where: { id },
      data: { visibilityMode: mode },
    });
    await tx.opportunityActivity.create({
      data: {
        opportunityId: id,
        ...opportunityActivity(companyId, staff.id, "VISIBILITY_CHANGED", {
          fromVisibility: current.visibilityMode,
          toVisibility: mode,
        }),
      },
    });
    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "opportunity.visibility_changed",
      targetType: "Opportunity",
      targetId: id,
      fromState: current.visibilityMode,
      toState: mode,
    });
    return opportunity;
  });
}

export async function transitionOpportunityStatus(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  toStatus: OpportunityStatus,
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.opportunity.findFirst({ where: { id, companyId } });
    if (!current) notFound("Opportunity not found.");
    opportunityMachine.assertTransition(current.status, toStatus);
    const opportunity = await tx.opportunity.update({
      where: { id },
      data: { status: toStatus },
    });
    await tx.opportunityActivity.create({
      data: {
        opportunityId: id,
        ...opportunityActivity(companyId, staff.id, "STATUS_CHANGED", {
          fromStatus: current.status,
          toStatus,
        }),
      },
    });
    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "opportunity.status_changed",
      targetType: "Opportunity",
      targetId: id,
      fromState: current.status,
      toState: toStatus,
    });
    return opportunity;
  });
}
