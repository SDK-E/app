import { requirePermission } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import { forbidden } from "@/lib/users/shared";
import type { AppPrincipal, SdkStaffRole } from "@/types";

export async function updateStaffUser(
  principal: AppPrincipal,
  userId: string,
  input: { role?: SdkStaffRole; isActive?: boolean }
) {
  requirePermission(principal, "staff:update");
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  if (userId === principal.id && input.isActive === false)
    forbidden("You cannot deactivate your own account.");
  const target = await getPrisma().user.findUniqueOrThrow({
    where: { id: userId },
    include: { memberships: true },
  });
  if (input.role && target.memberships.length)
    forbidden("Company members cannot receive SDK staff roles.");
  if (
    target.sdkStaffRole === "ADMIN" &&
    (input.isActive === false || (input.role && input.role !== "ADMIN"))
  ) {
    const admins = await getPrisma().user.count({
      where: { sdkStaffRole: "ADMIN", isActive: true },
    });
    if (admins <= 1) forbidden("The last active SDK administrator cannot be changed.");
  }
  return getPrisma().user.update({ where: { id: userId }, data: input });
}
