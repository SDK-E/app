import { notFound, requireSdkStaff } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import { requireActiveCompany } from "@/lib/requests/guards";
import { createAuditEvent } from "@/lib/audit";
import { opportunityActivity } from "@/lib/opportunities/workflow/shared";
import type { AppPrincipal } from "@/types";

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
