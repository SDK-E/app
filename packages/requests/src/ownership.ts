import type { AppPrincipal } from "@platform/types";

import { notFound, requireSdkStaff } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import { activity, requireActiveCompany, scope } from "@platform/requests/guards";

export async function assignRequestOwner(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  ownerId: string,
) {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  scope(staff, "request:update");
  await requireActiveCompany(staff, companyId);
  return getPrisma().$transaction(async (tx) => {
    const current = await tx.request.findFirst({
      where: { id, companyId },
      select: { id: true, ownerId: true },
    });
    if (!current) notFound("Request not found.");
    const updated = await tx.request.update({
      where: { id },
      data: { ownerId },
    });
    await tx.requestActivity.create({
      data: { requestId: id, ...activity(companyId, staff.id, "OWNER_ASSIGNED") },
    });
    return updated;
  });
}
