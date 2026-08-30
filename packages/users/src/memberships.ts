import type { AppPrincipal, ClientRole } from "@platform/types";

import { requireCompanyAccess, requirePermission } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import { recordUserManagementEvent } from "@platform/users/audit";
import { assertClientRoleGrant, forbidden } from "@platform/users/shared";

export async function removeMembership(
  principal: AppPrincipal,
  membershipId: string,
  companyId?: string,
) {
  requirePermission(principal, "membership:remove", companyId);
  const membership = await getPrisma().membership.findUniqueOrThrow({
    where: { id: membershipId },
  });
  if (principal.kind === "client") {
    requireCompanyAccess(principal, companyId);
    if (membership.companyId !== companyId) forbidden("Cross-company access is denied.");
    if (membership.userId === principal.id) forbidden("You cannot remove your own access.");
  }
  if (principal.kind === "sdk-staff" && principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  if (membership.role === "OWNER") {
    const owners = await getPrisma().membership.count({
      where: { companyId: membership.companyId, role: "OWNER" },
    });
    if (owners <= 1) forbidden("The last company owner cannot be removed.");
  }
  await getPrisma().membership.delete({ where: { id: membershipId } });
  const remaining = await getPrisma().membership.count({ where: { userId: membership.userId } });
  await recordUserManagementEvent(principal, {
    action: "membership.removed",
    companyId: membership.companyId,
    targetType: "membership",
    targetId: membership.id,
    fromState: membership.role,
  });
  return { removed: membership, hasNoMemberships: remaining === 0 };
}
export async function updateMembershipRole(
  principal: AppPrincipal,
  membershipId: string,
  role: ClientRole,
  companyId?: string,
) {
  requirePermission(principal, "membership:update", companyId);
  const membership = await getPrisma().membership.findUniqueOrThrow({
    where: { id: membershipId },
  });
  if (membership.role === "OWNER" && role === "OWNER") return membership;
  assertClientRoleGrant(principal, role, companyId);
  assertMembershipEditable(principal, membership, companyId, role);

  const updated = await getPrisma().membership.update({
    where: { id: membershipId },
    data: { role },
  });
  await recordUserManagementEvent(principal, {
    action: "membership.role_changed",
    companyId: membership.companyId,
    targetType: "membership",
    targetId: membership.id,
    fromState: membership.role,
    toState: role,
  });
  return updated;
}

function assertMembershipEditable(
  principal: AppPrincipal,
  membership: { role: string; userId: string; companyId: string },
  companyId: string | undefined,
  newRole: ClientRole,
) {
  if (principal.kind === "client") {
    requireCompanyAccess(principal, companyId);
    if (membership.companyId !== companyId) forbidden("Cross-company access is denied.");
    if (membership.userId === principal.id) forbidden("You cannot change your own role.");
  }
  if (principal.kind === "sdk-staff" && principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  if (membership.role === "OWNER" && newRole !== "OWNER")
    forbidden("Ownership transfer is not available from user management.");
}
