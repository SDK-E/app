import type { AppPrincipal } from "@platform/types";

import { notFound, requireSdkStaff } from "@platform/auth/authorization";
import { createAuditEvent } from "@platform/core/audit";
import { getPrisma } from "@platform/db";
import { opportunityActivity } from "@platform/opportunities/workflow/shared";
import { requireActiveCompany } from "@platform/requests/guards";

export async function addInternalNote(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  note: string,
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
