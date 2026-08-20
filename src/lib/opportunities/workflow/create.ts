import { requireSdkStaff } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import { requireActiveCompany } from "@/lib/requests/guards";
import { createAuditEvent } from "@/lib/audit";
import {
  buildOpportunityData,
  opportunityActivity,
  type CreateOpportunityInput,
} from "@/lib/opportunities/workflow/shared";
import type { AppPrincipal } from "@/types";

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
