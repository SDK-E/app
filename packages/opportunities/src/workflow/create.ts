import type { AppPrincipal } from "@platform/types";

import { requireSdkStaff } from "@platform/auth/authorization";
import { createAuditEvent } from "@platform/core/audit";
import { getPrisma } from "@platform/db";
import {
  buildOpportunityData,
  type CreateOpportunityInput,
  opportunityActivity,
} from "@platform/opportunities/workflow/shared";
import { requireActiveCompany } from "@platform/requests/guards";

export async function createOpportunity(
  principal: AppPrincipal,
  companyId: string,
  input: CreateOpportunityInput,
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
