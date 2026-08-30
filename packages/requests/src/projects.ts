import type { AppPrincipal } from "@platform/types";

import { notFound, requireSdkStaff } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import { activity, requireActiveCompany, scope } from "@platform/requests/guards";

export async function convertRequestToProject(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  input: { name: string; description: string },
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  scope(staff, "project:create");
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({
      where: { id, companyId },
      include: { projects: { select: { id: true }, take: 1 } },
    });
    if (!current) notFound("Request not found.");
    if (current.status !== "APPROVED")
      throw new Error("Only accepted requests can become projects.");
    if (current.projects.length) throw new Error("This request is already linked to a project.");
    const project = await tx.project.create({
      data: { companyId, requestId: id, createdBy: staff.id, ...input },
    });
    await tx.requestActivity.create({
      data: { requestId: id, ...activity(companyId, staff.id, "CONVERTED_TO_PROJECT") },
    });
    return project;
  });
}

export async function listActiveCompanies(principal: AppPrincipal) {
  requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  return getPrisma().company.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
