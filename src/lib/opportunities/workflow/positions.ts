import { notFound, requireSdkStaff } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import { requireActiveCompany } from "@/lib/requests/guards";
import { createAuditEvent } from "@/lib/audit";
import {
  buildPositionData,
  opportunityActivity,
  type OpportunityPositionInput,
} from "@/lib/opportunities/workflow/shared";
import type { AppPrincipal } from "@/types";

export async function addPosition(
  principal: AppPrincipal,
  companyId: string,
  opportunityId: string,
  input: OpportunityPositionInput
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const parent = await tx.opportunity.findFirst({ where: { id: opportunityId, companyId } });
    if (!parent) notFound("Opportunity not found.");
    const position = await tx.opportunityPosition.create({
      data: {
        opportunityId,
        companyId,
        ...buildPositionData(input),
      },
    });
    await tx.opportunityActivity.create({
      data: { opportunityId, ...opportunityActivity(companyId, staff.id, "POSITION_ADDED") },
    });
    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "opportunity.position_added",
      targetType: "OpportunityPosition",
      targetId: position.id,
    });
    return position;
  });
}

export async function updatePosition(
  principal: AppPrincipal,
  companyId: string,
  opportunityId: string,
  positionId: string,
  input: OpportunityPositionInput
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const parent = await tx.opportunity.findFirst({ where: { id: opportunityId, companyId } });
    if (!parent) notFound("Opportunity not found.");
    const position = await tx.opportunityPosition.findFirst({
      where: { id: positionId, opportunityId, companyId },
    });
    if (!position) notFound("Opportunity position not found.");
    const updated = await tx.opportunityPosition.update({
      where: { id: positionId },
      data: buildPositionData(input),
    });
    await tx.opportunityActivity.create({
      data: { opportunityId, ...opportunityActivity(companyId, staff.id, "POSITION_UPDATED") },
    });
    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "opportunity.position_updated",
      targetType: "OpportunityPosition",
      targetId: positionId,
    });
    return updated;
  });
}

export async function removePosition(
  principal: AppPrincipal,
  companyId: string,
  opportunityId: string,
  positionId: string
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const parent = await tx.opportunity.findFirst({ where: { id: opportunityId, companyId } });
    if (!parent) notFound("Opportunity not found.");
    const existing = await tx.opportunityPosition.findFirst({
      where: { id: positionId, opportunityId, companyId },
    });
    if (!existing) notFound("Opportunity position not found.");
    await tx.opportunityPosition.delete({ where: { id: positionId } });
    await tx.opportunityActivity.create({
      data: { opportunityId, ...opportunityActivity(companyId, staff.id, "POSITION_REMOVED") },
    });
    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "opportunity.position_removed",
      targetType: "OpportunityPosition",
      targetId: positionId,
    });
  });
}
