import { notFound, requireSdkStaff } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import { requireActiveCompany } from "@/lib/requests/guards";
import { createAuditEvent } from "@/lib/audit";
import { canViewOpportunity } from "@/lib/opportunities/safe";
import { type AddAttachmentInput } from "@/lib/opportunities/workflow/shared";
import type { AppPrincipal } from "@/types";

export async function addAttachment(
  principal: AppPrincipal,
  companyId: string,
  opportunityId: string,
  input: AddAttachmentInput
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const parent = await tx.opportunity.findFirst({ where: { id: opportunityId, companyId } });
    if (!parent) notFound("Opportunity not found.");
    if (!canViewOpportunity(staff, parent.visibilityMode)) {
      notFound("Opportunity not found.");
    }
    const document = await tx.document.create({
      data: {
        companyId,
        opportunityId,
        opportunityPositionId: input.opportunityPositionId ?? null,
        name: input.name,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        status: "DRAFT",
        uploadedBy: staff.id,
      },
    });
    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "opportunity.attachment_added",
      targetType: "Document",
      targetId: document.id,
    });
    return document;
  });
}
