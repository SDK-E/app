import { requireSdkStaff } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import { requireActiveCompany } from "@sdk-e/requests/guards";
import { createAuditEvent } from "@sdk-e/core/audit";
import {
  buildOpportunityData,
  opportunityActivity,
  type CreateOpportunityInput,
} from "@sdk-e/opportunities/workflow/shared";
import type { AppPrincipal } from "@sdk-e/types";

export async function createOpportunity(
  principal: AppPrincipal,
  companyId: string,
  input: CreateOpportunityInput
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const opportunity = await tx.opportunity.create({
      data: {
        companyId,
        status: "DRAFT",
        createdBy: staff.id,
        ...buildOpportunityData(input),
      },
    });
    await tx.opportunityActivity.create({
      data: {
        opportunityId: opportunity.id,
        ...opportunityActivity(companyId, staff.id, "CREATED"),
      },
    });
    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "opportunity.created",
      targetType: "Opportunity",
      targetId: opportunity.id,
    });
    return opportunity;
  });
}
