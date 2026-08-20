import { notFound, requireSdkStaff } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import { requireActiveCompany } from "@/lib/requests/guards";
import { createAuditEvent } from "@/lib/audit";
import {
  opportunityActivity,
  toDecimal,
  type UpdateOpportunityDraftInput,
} from "@/lib/opportunities/workflow/shared";
import type { AppPrincipal } from "@/types";

export async function updateOpportunityDraft(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  input: UpdateOpportunityDraftInput
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.opportunity.findFirst({ where: { id, companyId } });
    if (!current) notFound("Opportunity not found.");
    if (current.status !== "DRAFT" && current.status !== "ON_HOLD") {
      throw new Error("Opportunity can only be edited while in DRAFT or ON_HOLD.");
    }
    const opportunity = await tx.opportunity.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        clientName: input.clientName,
        ndaRequired: input.ndaRequired,
        clientIdentityVisible: input.clientIdentityVisible,
        requiredSkills: input.requiredSkills,
        preferredSkills: input.preferredSkills,
        seniority: input.seniority,
        engagementType: input.engagementType,
        budgetMin: toDecimal(input.budgetMin),
        budgetMax: toDecimal(input.budgetMax),
        currency: input.currency,
        duration: input.duration,
        startDate: input.startDate,
        deadline: input.deadline,
        locationTimezone: input.locationTimezone,
        languages: input.languages,
        deliverables: input.deliverables,
        providerCount: input.providerCount,
      },
    });
    await tx.opportunityActivity.create({
      data: { opportunityId: id, ...opportunityActivity(companyId, staff.id, "UPDATED") },
    });
    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "opportunity.updated",
      targetType: "Opportunity",
      targetId: id,
    });
    return opportunity;
  });
}
