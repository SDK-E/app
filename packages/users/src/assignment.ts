import type { AppPrincipal, ClientRole } from "@platform/types";

import { notFound, requirePermission } from "@platform/auth/authorization";
import { assignCompanyMembership } from "@platform/auth/identity-management";
import { getPrisma } from "@platform/db";
import { recordUserManagementEvent } from "@platform/users/audit";
import { forbidden } from "@platform/users/shared";

export async function assignCompanyMemberDirectly(
  principal: AppPrincipal,
  input: { userId: string; companyId: string; role: ClientRole },
) {
  requirePermission(principal, "membership:create", input.companyId);
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");

  const { company, user } = await fetchCompanyAndUser(input);
  assertUserEligibleForMembership(user);
  await assertNoExistingMembership(input);

  if (input.role === "OWNER") {
    await assertNoExistingOwner(input.companyId);
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

async function assertNoExistingMembership(input: { userId: string; companyId: string }) {
  const existing = await getPrisma().membership.findFirst({
    where: { userId: input.userId, companyId: input.companyId },
    select: { id: true },
  });
  if (existing) forbidden("This user is already a member of this company.");
}

async function assertNoExistingOwner(companyId: string) {
  const owner = await getPrisma().membership.findFirst({
    where: { companyId, role: "OWNER" },
    select: { id: true },
  });
  if (owner) forbidden("This company already has an owner.");
}

function assertUserEligibleForMembership(user: {
  sdkStaffRole: null | string;
  provider: { id: string } | null;
}) {
  if (user.sdkStaffRole) forbidden("SDK staff accounts cannot receive company memberships.");
  if (user.provider) forbidden("Provider accounts cannot receive company memberships.");
}

async function fetchCompanyAndUser(input: { userId: string; companyId: string }) {
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
  return { company, user };
}
