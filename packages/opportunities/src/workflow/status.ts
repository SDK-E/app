import { notFound, requireSdkStaff } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import { requireActiveCompany } from "@sdk-e/requests/guards";
import { createAuditEvent } from "@sdk-e/core/audit";
import { opportunityMachine } from "@sdk-e/opportunities/machine";
import { opportunityActivity } from "@sdk-e/opportunities/workflow/shared";
import type { OpportunityStatus, OpportunityVisibilityMode } from "@sdk-e/db/client";
import type { AppPrincipal } from "@sdk-e/types";

export async function transitionOpportunityStatus(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  toStatus: OpportunityStatus
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

export async function setVisibilityMode(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  mode: OpportunityVisibilityMode
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
