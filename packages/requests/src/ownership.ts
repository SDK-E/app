import { notFound, requireSdkStaff } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import { activity, requireActiveCompany, scope } from "@sdk-e/requests/guards";
import type { AppPrincipal } from "@sdk-e/types";

export async function assignRequestOwner(
  principal: AppPrincipal,
  companyId: string,
  id: string,
  ownerId: string
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
