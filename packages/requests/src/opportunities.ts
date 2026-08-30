import { notFound, requireSdkStaff } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import { activity, requireActiveCompany, scope } from "@sdk-e/requests/guards";
import type { AppPrincipal } from "@sdk-e/types";

function composeOpportunityDescription(request: {
  description: string;
  businessContext: string | null;
  desiredOutcomes: string | null;
}) {
  const parts = [request.description];
  if (request.businessContext) parts.push(request.businessContext);
  if (request.desiredOutcomes) parts.push(request.desiredOutcomes);
  return parts.join("\n\n");
}

export async function convertRequestToOpportunity(
  principal: AppPrincipal,
  companyId: string,
  id: string
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  scope(staff, "request:update");
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({
      where: { id, companyId },
      include: { opportunity: { select: { id: true } } },
    });
    if (!current) notFound("Request not found.");
    if (current.status !== "APPROVED")
      throw new Error("Only approved requests can become opportunities.");
    if (current.opportunity) throw new Error("This request is already linked to an opportunity.");
    const opportunity = await tx.opportunity.create({
      data: {
        companyId,
        requestId: id,
        title: current.title,
        description: composeOpportunityDescription(current),
        visibilityMode: "INVITE_ONLY",
        status: "DRAFT",
        createdBy: staff.id,
        requiredSkills: current.requiredSkills ?? [],
        preferredSkills: current.preferredSkills ?? [],
        seniority: current.seniority ?? null,
        engagementType: current.preferredEngagementModel ?? null,
        startDate: current.startDate ?? null,
        duration: current.duration ?? null,
        locationTimezone: current.locationTimezone ?? null,
        languages: current.language ? [current.language] : [],
      },
    });
    await tx.requestActivity.create({
      data: { requestId: id, ...activity(companyId, staff.id, "CONVERTED_TO_OPPORTUNITY") },
    });
    return opportunity;
  });
}
