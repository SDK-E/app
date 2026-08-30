import type { AppPrincipal, SdkStaffRole } from "@platform/types";

import { requirePermission } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import { recordUserManagementEvent } from "@platform/users/audit";
import { forbidden } from "@platform/users/shared";

export async function updateStaffUser(
  principal: AppPrincipal,
  userId: string,
  input: { role?: SdkStaffRole; isActive?: boolean },
) {
  requirePermission(principal, "staff:update");
  assertAdmin(principal);
  assertSelfDeactivation(principal, userId, input.isActive);

  const target = await getPrisma().user.findUniqueOrThrow({
    where: { id: userId },
    include: { memberships: true },
  });

  assertNotCompanyMember(target, input.role);
  await assertLastAdminChangeable(target, input);

  const updated = await getPrisma().user.update({ where: { id: userId }, data: input });
  await recordRoleChangeEvent(principal, userId, input, target);
  await recordActiveStateEvent(principal, userId, input, target);
  return updated;
}

function assertAdmin(principal: AppPrincipal) {
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
}

async function assertLastAdminChangeable(
  target: { sdkStaffRole: null | string; isActive: boolean },
  input: { role?: SdkStaffRole; isActive?: boolean },
) {
  if (
    target.sdkStaffRole === "ADMIN" &&
    (input.isActive === false || (input.role && input.role !== "ADMIN"))
  ) {
    const admins = await getPrisma().user.count({
      where: { sdkStaffRole: "ADMIN", isActive: true },
    });
    if (admins <= 1) forbidden("The last active SDK administrator cannot be changed.");
  }
}

function assertNotCompanyMember(
  target: { memberships: unknown[]; sdkStaffRole: null | string },
  role?: SdkStaffRole,
) {
  if (role && target.memberships.length)
    forbidden("Company members cannot receive SDK staff roles.");
}

function assertSelfDeactivation(principal: AppPrincipal, userId: string, isActive?: boolean) {
  if (userId === principal.id && isActive === false)
    forbidden("You cannot deactivate your own account.");
}

async function recordActiveStateEvent(
  principal: AppPrincipal,
  userId: string,
  input: { isActive?: boolean },
  target: { isActive: boolean },
) {
  if (input.isActive !== undefined && input.isActive !== target.isActive) {
    await recordUserManagementEvent(principal, {
      targetType: "user",
      targetId: userId,
      action: "user.active_changed",
      fromState: target.isActive ? "ACTIVE" : "INACTIVE",
      toState: input.isActive ? "ACTIVE" : "INACTIVE",
    });
  }
}

async function recordRoleChangeEvent(
  principal: AppPrincipal,
  userId: string,
  input: { role?: SdkStaffRole },
  target: { sdkStaffRole: null | string },
) {
  if (input.role && input.role !== target.sdkStaffRole) {
    await recordUserManagementEvent(principal, {
      targetType: "user",
      targetId: userId,
      action: "staff_role.changed",
      fromState: target.sdkStaffRole,
      toState: input.role,
    });
  }
}
