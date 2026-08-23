import { notFound, requireSdkStaff } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import { requireActiveCompany } from "@sdk-e/requests/guards";
import { createAuditEvent } from "@sdk-e/core/audit";
import { opportunityActivity } from "@sdk-e/opportunities/workflow/shared";
import type { AppPrincipal } from "@sdk-e/types";

export async function addInternalNote(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  note: string
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.opportunity.findFirst({ where: { id, companyId } });
    if (!current) notFound("Opportunity not found.");
    const next = current.internalNotes ? `${current.internalNotes}\n${note}` : note;
    const opportunity = await tx.opportunity.update({
      where: { id },
      data: { internalNotes: next },
    });
    await tx.opportunityActivity.create({
      data: { opportunityId: id, ...opportunityActivity(companyId, staff.id, "NOTE_ADDED") },
    });
    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "opportunity.note_added",
      targetType: "Opportunity",
      targetId: id,
    });
    return opportunity;
  });
}
