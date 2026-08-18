import { randomBytes } from "node:crypto";

import { requirePermission } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import {
  assertClientRoleGrant,
  hashInvitationToken,
  INVITATION_TTL_MS,
  normalizeEmail,
  forbidden,
} from "@/lib/users/shared";
import type { AppPrincipal, ClientRole, SdkStaffRole } from "@/types";

export async function createClientInvitation(
  principal: AppPrincipal,
  input: { email: string; role: Exclude<ClientRole, "OWNER"> },
  companyId: string
) {
  requirePermission(principal, "membership:invite", companyId);
  assertClientRoleGrant(principal, input.role, companyId);
  if (principal.kind === "sdk-staff" && principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
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
  return { invitation, token };
}

export async function createStaffInvitation(
  principal: AppPrincipal,
  input: { email: string; role: SdkStaffRole }
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
  return { invitation, token };
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

export async function revokeInvitation(principal: AppPrincipal, id: string, companyId?: string) {
  const invitation = await getPrisma().invitation.findUniqueOrThrow({ where: { id } });
  if (principal.kind === "client") {
    requirePermission(principal, "membership:invite", companyId);
    if (invitation.companyId !== companyId) forbidden("Cross-company access is denied.");
  } else if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  return getPrisma().invitation.update({ where: { id }, data: { revokedAt: new Date() } });
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
  return {
    invitation: updated,
    token,
    previousTokenHash: invitation.tokenHash,
    previousExpiresAt: invitation.expiresAt,
  };
}

export async function restoreInvitationDelivery(
  id: string,
  previous: { tokenHash: string; expiresAt: Date }
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
