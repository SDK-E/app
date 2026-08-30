import { requirePermission } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import { recordUserManagementEvent } from "@sdk-e/users/audit";
import { forbidden } from "@sdk-e/users/shared";
import type { AppPrincipal, SdkStaffRole } from "@sdk-e/types";

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
  const updated = await getPrisma().user.update({ where: { id: userId }, data: input });
  if (input.role && input.role !== target.sdkStaffRole) {
    await recordUserManagementEvent(principal, {
      targetType: "user",
      targetId: userId,
      action: "staff_role.changed",
      fromState: target.sdkStaffRole,
      toState: input.role,
    });
  }
  if (input.isActive !== undefined && input.isActive !== target.isActive) {
    await recordUserManagementEvent(principal, {
      targetType: "user",
      targetId: userId,
      action: "user.active_changed",
      fromState: target.isActive ? "ACTIVE" : "INACTIVE",
      toState: input.isActive ? "ACTIVE" : "INACTIVE",
    });
  }
  return updated;
}
