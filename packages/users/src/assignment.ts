import { notFound, requirePermission } from "@sdk-e/auth/authorization";
import { assignCompanyMembership } from "@sdk-e/auth/identity-management";
import { getPrisma } from "@sdk-e/db";
import { recordUserManagementEvent } from "@sdk-e/users/audit";
import { forbidden } from "@sdk-e/users/shared";
import type { AppPrincipal, ClientRole } from "@sdk-e/types";

export async function assignCompanyMemberDirectly(
  principal: AppPrincipal,
  input: { userId: string; companyId: string; role: ClientRole }
) {
  requirePermission(principal, "membership:create", input.companyId);
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");

  const company = await getPrisma().company.findFirst({
    where: { id: input.companyId, isActive: true },
  });
  if (!company) notFound("Company not found.");

  const user = await getPrisma().user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      name: true,
      sdkStaffRole: true,
      provider: { select: { id: true } },
    },
  });
  if (!user) notFound("User not found.");
  if (user.sdkStaffRole) forbidden("SDK staff accounts cannot receive company memberships.");
  if (user.provider) forbidden("Provider accounts cannot receive company memberships.");

  const existingMembership = await getPrisma().membership.findFirst({
    where: { userId: input.userId, companyId: input.companyId },
    select: { id: true },
  });
  if (existingMembership) forbidden("This user is already a member of this company.");

  if (input.role === "OWNER") {
    const owner = await getPrisma().membership.findFirst({
      where: { companyId: input.companyId, role: "OWNER" },
      select: { id: true },
    });
    if (owner) forbidden("This company already has an owner.");
  } else if (input.role === "ADMINISTRATOR" && principal.role !== "ADMIN") {
    forbidden("SDK administrator access is required.");
  }

  const membership = await assignCompanyMembership({
    userId: input.userId,
    companyId: input.companyId,
    role: input.role,
    invitedBy: principal.id,
  });

  // A direct assignment supersedes any pending access request for the same
  // person and company: the request's goal has been achieved another way.
  const superseded = await getPrisma().companyAccessRequest.updateMany({
    where: { userId: input.userId, companyId: input.companyId, status: "PENDING" },
    data: {
      status: "CANCELLED",
      resolvedAt: new Date(),
      resolvedBy: principal.id,
    },
  });

  await recordUserManagementEvent(principal, {
    action: "membership.assigned",
    companyId: input.companyId,
    targetType: "membership",
    targetId: membership.id,
    toState: input.role,
    metadata: {
      userId: input.userId,
      supersededRequestId: superseded.count > 0,
    },
  });

  return { membership, user, company };
}

export async function setAccountActive(principal: AppPrincipal, userId: string, isActive: boolean) {
  requirePermission(principal, "user:activate");
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  if (userId === principal.id && !isActive) forbidden("You cannot deactivate your own account.");
  const target = await getPrisma().user.findUniqueOrThrow({ where: { id: userId } });
  if (target.sdkStaffRole) forbidden("Use SDK staff management for staff accounts.");
  if (target.isActive === isActive) return target;
  const updated = await getPrisma().user.update({
    where: { id: userId },
    data: { isActive },
  });
  await recordUserManagementEvent(principal, {
    targetType: "user",
    targetId: userId,
    action: "user.active_changed",
    fromState: target.isActive ? "ACTIVE" : "INACTIVE",
    toState: isActive ? "ACTIVE" : "INACTIVE",
  });
  return updated;
}

export async function updateUserName(principal: AppPrincipal, userId: string, name: string) {
  requirePermission(principal, "user:update");
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  const trimmed = name.trim();
  if (!trimmed) forbidden("Enter a name.");
  const target = await getPrisma().user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true },
  });
  const updated = await getPrisma().user.update({
    where: { id: userId },
    data: { name: trimmed },
  });
  await recordUserManagementEvent(principal, {
    targetType: "user",
    targetId: userId,
    action: "user.name_corrected",
    fromState: target.name,
    toState: trimmed,
  });
  return updated;
}
