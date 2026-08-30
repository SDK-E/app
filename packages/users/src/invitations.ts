import type { AppPrincipal, ClientRole, SdkStaffRole } from "@platform/types";

import { requirePermission } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import { recordUserManagementEvent } from "@platform/users/audit";
import {
  assertClientRoleGrant,
  forbidden,
  hashInvitationToken,
  INVITATION_TTL_MS,
  normalizeEmail,
} from "@platform/users/shared";
import { randomBytes } from "node:crypto";

export async function createClientInvitation(
  principal: AppPrincipal,
  input: { email: string; role: ClientRole },
  companyId: string,
) {
  requirePermission(principal, "membership:invite", companyId);
  await validateInvitationEligibility(principal, input.role, companyId);

  const company = await getPrisma().company.findFirst({ where: { id: companyId, isActive: true } });
  if (!company) forbidden("The company is not available.");
  const email = normalizeEmail(input.email);
  const existingUser = await getPrisma().user.findFirst({
    where: {
      email,
      OR: [{ sdkStaffRole: { not: null } }, { memberships: { some: { companyId } } }],
    },
    select: { id: true, sdkStaffRole: true, memberships: { select: { id: true }, take: 1 } },
  });
  if (existingUser?.sdkStaffRole)
    forbidden("SDK staff accounts cannot receive client-company invitations.");
  if (existingUser?.memberships.length)
    forbidden("This email is already a member of this company.");
  const pending = await getPrisma().invitation.findFirst({
    where: { email, kind: "CLIENT", companyId, acceptedAt: null, revokedAt: null },
    select: { id: true },
  });
  if (pending) forbidden("An invitation to this email is already pending. Resend it instead.");
  const token = randomBytes(32).toString("base64url");
  const invitation = await getPrisma().invitation.create({
    data: {
      tokenHash: hashInvitationToken(token),
      email,
      kind: "CLIENT",
      companyId,
      clientRole: input.role,
      invitedBy: principal.id,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    },
    include: { company: true },
  });
  await recordUserManagementEvent(principal, {
    action: "invitation.created",
    companyId,
    targetType: "invitation",
    targetId: invitation.id,
    toState: input.role,
  });
  return { invitation, token };
}

export async function createStaffInvitation(
  principal: AppPrincipal,
  input: { email: string; role: SdkStaffRole },
) {
  requirePermission(principal, "staff:create");
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  const email = normalizeEmail(input.email);
  const existingUser = await getPrisma().user.findFirst({
    where: { email },
    select: { id: true, sdkStaffRole: true, memberships: { select: { id: true }, take: 1 } },
  });
  if (existingUser && (existingUser.sdkStaffRole || existingUser.memberships.length))
    forbidden("This email already has an account with application access.");
  const pending = await getPrisma().invitation.findFirst({
    where: { email, kind: "SDK_STAFF", acceptedAt: null, revokedAt: null },
    select: { id: true },
  });
  if (pending) forbidden("An invitation to this email is already pending. Resend it instead.");
  const token = randomBytes(32).toString("base64url");
  const invitation = await getPrisma().invitation.create({
    data: {
      tokenHash: hashInvitationToken(token),
      email,
      kind: "SDK_STAFF",
      sdkStaffRole: input.role,
      invitedBy: principal.id,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    },
  });
  await recordUserManagementEvent(principal, {
    action: "invitation.created",
    targetType: "invitation",
    targetId: invitation.id,
    toState: input.role,
  });
  return { invitation, token };
}

export async function getInvitationPreview(token: string) {
  return getPrisma().invitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
    select: {
      email: true,
      kind: true,
      clientRole: true,
      sdkStaffRole: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
      company: { select: { name: true } },
      inviter: { select: { name: true } },
    },
  });
}

export async function markInvitationDelivery(id: string, sent: boolean) {
  if (sent) {
    return getPrisma().invitation.update({
      where: { id },
      data: {
        deliveryStatus: "SENT",
        lastSentAt: new Date(),
        deliveryAttempts: { increment: 1 },
      },
    });
  }
  await getPrisma().invitation.updateMany({
    where: { id, deliveryStatus: { not: "SENT" } },
    data: { deliveryStatus: "FAILED", deliveryAttempts: { increment: 1 } },
  });
}

export async function renewInvitation(principal: AppPrincipal, id: string, companyId?: string) {
  const invitation = await getPrisma().invitation.findUniqueOrThrow({
    where: { id },
    include: { company: true },
  });
  if (principal.kind === "client") {
    requirePermission(principal, "membership:invite", companyId);
    if (invitation.companyId !== companyId) forbidden("Cross-company access is denied.");
  } else if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  if (invitation.acceptedAt || invitation.revokedAt)
    forbidden("This invitation is no longer pending.");
  const token = randomBytes(32).toString("base64url");
  const updated = await getPrisma().invitation.update({
    where: { id },
    data: {
      tokenHash: hashInvitationToken(token),
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      deliveryStatus: "PENDING",
    },
    include: { company: true },
  });
  await recordUserManagementEvent(principal, {
    action: "invitation.renewed",
    companyId: invitation.companyId,
    targetType: "invitation",
    targetId: invitation.id,
  });
  return {
    invitation: updated,
    token,
    previousTokenHash: invitation.tokenHash,
    previousExpiresAt: invitation.expiresAt,
  };
}

export async function restoreInvitationDelivery(
  id: string,
  previous: { tokenHash: string; expiresAt: Date },
) {
  return getPrisma().invitation.update({
    where: { id },
    data: {
      tokenHash: previous.tokenHash,
      expiresAt: previous.expiresAt,
      deliveryStatus: "PENDING",
    },
  });
}

export async function revokeInvitation(principal: AppPrincipal, id: string, companyId?: string) {
  const invitation = await getPrisma().invitation.findUniqueOrThrow({ where: { id } });
  if (principal.kind === "client") {
    requirePermission(principal, "membership:invite", companyId);
    if (invitation.companyId !== companyId) forbidden("Cross-company access is denied.");
  } else if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  const revoked = await getPrisma().invitation.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  await recordUserManagementEvent(principal, {
    action: "invitation.revoked",
    companyId: invitation.companyId,
    targetType: "invitation",
    targetId: invitation.id,
  });
  return revoked;
}

async function validateInvitationEligibility(
  principal: AppPrincipal,
  role: ClientRole,
  companyId: string,
) {
  if (principal.kind === "sdk-staff" && principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  if (role === "OWNER") {
    if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
      forbidden("Only SDK administrators can invite a company owner.");
    const owner = await getPrisma().membership.findFirst({
      where: { companyId, role: "OWNER" },
      select: { id: true },
    });
    if (owner) forbidden("This company already has an owner.");
  } else {
    assertClientRoleGrant(principal, role, companyId);
  }
}
