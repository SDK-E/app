import { requireCompanyAccess, requirePermission } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import { assertClientRoleGrant, forbidden } from "@/lib/users/shared";
import type { AppPrincipal, ClientRole } from "@/types";

export async function updateMembershipRole(
  principal: AppPrincipal,
  membershipId: string,
  role: ClientRole,
  companyId?: string
) {
  requirePermission(principal, "membership:update", companyId);
  const membership = await getPrisma().membership.findUniqueOrThrow({
    where: { id: membershipId },
  });
  if (membership.role === "OWNER" && role === "OWNER") return membership;
  assertClientRoleGrant(principal, role, companyId);
  if (principal.kind === "client") {
    requireCompanyAccess(principal, companyId);
    if (membership.companyId !== companyId) forbidden("Cross-company access is denied.");
    if (membership.userId === principal.id) forbidden("You cannot change your own role.");
  }
  if (principal.kind === "sdk-staff" && principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  if (membership.role === "OWNER" && role !== "OWNER")
    forbidden("Ownership transfer is not available from user management.");
  return getPrisma().membership.update({ where: { id: membershipId }, data: { role } });
}
export async function removeMembership(
  principal: AppPrincipal,
  membershipId: string,
  companyId?: string
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
  return { removed: membership, hasNoMemberships: remaining === 0 };
}
