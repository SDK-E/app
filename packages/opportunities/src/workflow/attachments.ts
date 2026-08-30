import type { AppPrincipal } from "@platform/types";

import { notFound, requireSdkStaff } from "@platform/auth/authorization";
import { createAuditEvent } from "@platform/core/audit";
import { getPrisma } from "@platform/db";
import { canViewOpportunity } from "@platform/opportunities/safe";
import { type AddAttachmentInput } from "@platform/opportunities/workflow/shared";
import { requireActiveCompany } from "@platform/requests/guards";

export async function addAttachment(
  principal: AppPrincipal,
  companyId: string,
  opportunityId: string,
  input: AddAttachmentInput,
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
