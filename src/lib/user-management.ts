import { createHash, randomBytes } from "node:crypto";

import { generateAccessCode } from "@/lib/companies";
import { getPrisma } from "@/lib/db";
import { AuthorizationError, notFound, requireCompanyAccess, requirePermission } from "@/lib/authorization";
import { assignCompanyMembership } from "@/lib/identity-management";
import type { CompanyAccessRequestStatus } from "@/generated/prisma/client";
import type { AppPrincipal, ClientRole, SdkStaffRole } from "@/types";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function forbidden(message: string): never {
  throw new AuthorizationError(403, "FORBIDDEN", message);
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function canManageUsers(principal: AppPrincipal): boolean {
  return principal.kind === "sdk-staff"
    ? principal.role === "ADMIN"
    : principal.kind === "client" && ["OWNER", "ADMINISTRATOR"].includes(principal.role);
}

export async function getUserManagementData(principal: AppPrincipal) {
  requirePermission(principal, "membership:view");
  const db = getPrisma();
  if (principal.kind === "client") {
    if (!canManageUsers(principal)) forbidden("User management is not available for this role.");
    const [memberships, invitations, accessRequests, company] = await Promise.all([
      db.membership.findMany({
        where: { companyId: principal.companyId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      }),
      db.invitation.findMany({
        where: { companyId: principal.companyId, acceptedAt: null, revokedAt: null },
        orderBy: { createdAt: "desc" },
      }),
      db.companyAccessRequest.findMany({
        where: { companyId: principal.companyId, status: "PENDING" },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } }, company: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.company.findUnique({ where: { id: principal.companyId } }),
    ]);
    return { kind: "client" as const, companies: [], memberships, invitations, users: [], accessRequests, company };
  }
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  const [users, companies, invitations, accessRequests] = await Promise.all([
    db.user.findMany({ include: { memberships: { include: { company: true } } }, orderBy: { createdAt: "desc" } }),
    db.company.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.invitation.findMany({ include: { company: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.companyAccessRequest.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } }, company: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { kind: "staff" as const, users, companies, invitations, memberships: [], accessRequests };
}

function assertClientRoleGrant(principal: AppPrincipal, role: ClientRole) {
  if (role === "OWNER") forbidden("Ownership cannot be granted from user management.");
  if (role === "ADMINISTRATOR" && (principal.kind !== "client" || principal.role !== "OWNER") && principal.kind !== "sdk-staff") {
    forbidden("Only a company owner can grant administrator access.");
  }
}

export async function createClientInvitation(
  principal: AppPrincipal,
  input: { email: string; role: Exclude<ClientRole, "OWNER">; companyId?: string },
) {
  requirePermission(principal, "membership:invite");
  assertClientRoleGrant(principal, input.role);
  const companyId = principal.kind === "client" ? principal.companyId : input.companyId;
  if (!companyId) forbidden("A company is required.");
  if (principal.kind === "sdk-staff" && principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  const company = await getPrisma().company.findFirst({ where: { id: companyId, isActive: true } });
  if (!company) forbidden("The company is not available.");
  const token = randomBytes(32).toString("base64url");
  const invitation = await getPrisma().invitation.create({
    data: {
      tokenHash: hashInvitationToken(token), email: input.email, kind: "CLIENT",
      companyId, clientRole: input.role, invitedBy: principal.id,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    },
    include: { company: true },
  });
  return { invitation, token };
}

export async function createStaffInvitation(principal: AppPrincipal, input: { email: string; role: SdkStaffRole }) {
  requirePermission(principal, "staff:create");
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  const token = randomBytes(32).toString("base64url");
  const invitation = await getPrisma().invitation.create({
    data: { tokenHash: hashInvitationToken(token), email: input.email, kind: "SDK_STAFF", sdkStaffRole: input.role, invitedBy: principal.id, expiresAt: new Date(Date.now() + INVITATION_TTL_MS) },
  });
  return { invitation, token };
}

export async function markInvitationDelivery(id: string, sent: boolean) {
  return getPrisma().invitation.update({ where: { id }, data: { deliveryStatus: sent ? "SENT" : "FAILED", lastSentAt: new Date() } });
}

export async function revokeInvitation(principal: AppPrincipal, id: string) {
  const invitation = await getPrisma().invitation.findUniqueOrThrow({ where: { id } });
  if (principal.kind === "client") {
    requirePermission(principal, "membership:invite");
    if (invitation.companyId !== principal.companyId) forbidden("Cross-company access is denied.");
  } else if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  return getPrisma().invitation.update({ where: { id }, data: { revokedAt: new Date() } });
}

export async function renewInvitation(principal: AppPrincipal, id: string) {
  const invitation = await getPrisma().invitation.findUniqueOrThrow({ where: { id }, include: { company: true } });
  if (principal.kind === "client") {
    requirePermission(principal, "membership:invite");
    if (invitation.companyId !== principal.companyId) forbidden("Cross-company access is denied.");
  } else if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  if (invitation.acceptedAt || invitation.revokedAt) forbidden("This invitation is no longer pending.");
  const token = randomBytes(32).toString("base64url");
  const updated = await getPrisma().invitation.update({
    where: { id },
    data: { tokenHash: hashInvitationToken(token), expiresAt: new Date(Date.now() + INVITATION_TTL_MS), deliveryStatus: "PENDING" },
    include: { company: true },
  });
  return { invitation: updated, token };
}

export async function updateMembershipRole(principal: AppPrincipal, membershipId: string, role: ClientRole) {
  requirePermission(principal, "membership:update");
  const membership = await getPrisma().membership.findUniqueOrThrow({ where: { id: membershipId } });
  if (membership.role === "OWNER" && role === "OWNER") return membership;
  assertClientRoleGrant(principal, role);
  if (principal.kind === "client" && membership.companyId !== principal.companyId) forbidden("Cross-company access is denied.");
  if (principal.kind === "client" && membership.userId === principal.id) forbidden("You cannot change your own role.");
  if (membership.role === "OWNER" && role !== "OWNER") forbidden("Ownership transfer is not available from user management.");
  if (principal.kind === "sdk-staff" && principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  return getPrisma().membership.update({ where: { id: membershipId }, data: { role } });
}

export async function removeMembership(principal: AppPrincipal, membershipId: string) {
  requirePermission(principal, "membership:remove");
  const membership = await getPrisma().membership.findUniqueOrThrow({ where: { id: membershipId } });
  if (principal.kind === "client" && membership.companyId !== principal.companyId) forbidden("Cross-company access is denied.");
  if (membership.userId === principal.id) forbidden("You cannot remove your own access.");
  if (membership.role === "OWNER") {
    const owners = await getPrisma().membership.count({ where: { companyId: membership.companyId, role: "OWNER" } });
    if (owners <= 1) forbidden("The last company owner cannot be removed.");
  }
  return getPrisma().membership.delete({ where: { id: membershipId } });
}

export async function updateStaffUser(principal: AppPrincipal, userId: string, input: { role?: SdkStaffRole; isActive?: boolean }) {
  requirePermission(principal, "staff:update");
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  if (userId === principal.id && input.isActive === false) forbidden("You cannot deactivate your own account.");
  const target = await getPrisma().user.findUniqueOrThrow({ where: { id: userId }, include: { memberships: true } });
  if (input.role && target.memberships.length) forbidden("Company members cannot receive SDK staff roles.");
  if (target.sdkStaffRole === "ADMIN" && (input.isActive === false || (input.role && input.role !== "ADMIN"))) {
    const admins = await getPrisma().user.count({ where: { sdkStaffRole: "ADMIN", isActive: true } });
    if (admins <= 1) forbidden("The last active SDK administrator cannot be changed.");
  }
  return getPrisma().user.update({ where: { id: userId }, data: input });
}

export async function acceptInvitation(input: { token: string; userId: string; email: string; emailVerified: boolean }) {
  if (!input.emailVerified) forbidden("Verify your email with Auth0 before accepting this invitation. Check the verification email in your inbox, then try again.");
  return getPrisma().$transaction(async db => {
    const invitation = await db.invitation.findUnique({ where: { tokenHash: hashInvitationToken(input.token) } });
    if (!invitation) forbidden("This invitation link is not valid. Ask the person who invited you to send a new one.");
    if (invitation.revokedAt) forbidden("This invitation has been revoked. Ask the person who invited you to send a new one.");
    if (invitation.acceptedAt) forbidden("This invitation has already been used.");
    if (invitation.expiresAt <= new Date()) forbidden("This invitation has expired. Ask the person who invited you to send a new one.");
    if (invitation.email !== input.email.trim().toLowerCase()) forbidden("Sign in with the email address that received this invitation.");
    const user = await db.user.findUniqueOrThrow({ where: { id: input.userId }, include: { memberships: true } });
    if (user.sdkStaffRole || user.memberships.length) forbidden("This account already has an application assignment.");
    if (invitation.kind === "CLIENT" && invitation.companyId && invitation.clientRole) {
      await db.membership.create({ data: { userId: user.id, companyId: invitation.companyId, role: invitation.clientRole, invitedBy: invitation.invitedBy, invitedAt: invitation.createdAt, joinedAt: new Date() } });
    } else if (invitation.kind === "SDK_STAFF" && invitation.sdkStaffRole) {
      await db.user.update({ where: { id: user.id }, data: { sdkStaffRole: invitation.sdkStaffRole } });
    } else forbidden("This invitation has an invalid target.");
    await db.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date(), acceptedBy: user.id } });
    return invitation;
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

export async function getUserAccessRequests(principal: AppPrincipal) {
  return getPrisma().companyAccessRequest.findMany({
    where: { userId: principal.id },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function requestCompanyAccess(principal: AppPrincipal, input: { code: string; requestedRole?: ClientRole }) {
  if (principal.kind !== "unassigned") forbidden("Only unassigned users can request access to a company.");
  const requestedRole = input.requestedRole ?? "VIEWER";
  if (requestedRole === "OWNER" || requestedRole === "ADMINISTRATOR") forbidden("Ownership and administrator access cannot be requested.");
  const code = input.code.trim().toUpperCase();
  if (!code) forbidden("Enter a company access code.");
  const company = await getPrisma().company.findFirst({ where: { accessCode: code, isActive: true } });
  if (!company) forbidden("That access code was not found. Check the code and try again.");
  const pending = await getPrisma().companyAccessRequest.findFirst({ where: { userId: principal.id, companyId: company.id, status: "PENDING" } });
  if (pending) forbidden("You already have a pending access request for this company.");
  return getPrisma().companyAccessRequest.create({
    data: { userId: principal.id, companyId: company.id, requestedRole },
    include: { company: { select: { name: true } } },
  });
}

export async function listCompanyAccessRequests(principal: AppPrincipal, input?: { companyId?: string; status?: CompanyAccessRequestStatus }) {
  const assigned = requirePermission(principal, "membership:update");
  if (!canManageUsers(principal)) forbidden("User management is not available for this role.");
  const status = input?.status ?? "PENDING";
  const include = {
    user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    company: { select: { name: true } },
  };
  if (principal.kind === "client") {
    const companyId = requireCompanyAccess(assigned, input?.companyId);
    return getPrisma().companyAccessRequest.findMany({ where: { companyId, status }, include, orderBy: { createdAt: "desc" } });
  }
  return getPrisma().companyAccessRequest.findMany({ where: { companyId: input?.companyId, status }, include, orderBy: { createdAt: "desc" } });
}

export async function approveCompanyAccessRequest(principal: AppPrincipal, requestId: string, input: { role?: ClientRole }) {
  const assigned = requirePermission(principal, "membership:update");
  if (!canManageUsers(principal)) forbidden("User management is not available for this role.");
  const role = input.role ?? "VIEWER";
  assertClientRoleGrant(principal, role);
  const request = await getPrisma().companyAccessRequest.findUnique({
    where: { id: requestId },
    include: { user: { select: { sdkStaffRole: true } } },
  });
  if (!request) notFound("Access request not found.");
  requireCompanyAccess(assigned, request.companyId);
  if (request.status !== "PENDING") forbidden("This access request has already been resolved.");
  if (request.user.sdkStaffRole) forbidden("This user is SDK staff and cannot receive company access.");
  const existing = await getPrisma().membership.findUnique({ where: { userId: request.userId } });
  if (existing) forbidden("This user already has an application assignment.");
  const membership = await assignCompanyMembership({ userId: request.userId, companyId: request.companyId, role, invitedBy: principal.id });
  const updated = await getPrisma().companyAccessRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", resolvedAt: new Date(), resolvedBy: principal.id },
    include: { company: { select: { name: true } }, user: { select: { id: true, name: true, email: true } } },
  });
  return { request: updated, membership };
}

export async function declineCompanyAccessRequest(principal: AppPrincipal, requestId: string) {
  const assigned = requirePermission(principal, "membership:update");
  if (!canManageUsers(principal)) forbidden("User management is not available for this role.");
  const request = await getPrisma().companyAccessRequest.findUnique({ where: { id: requestId } });
  if (!request) notFound("Access request not found.");
  requireCompanyAccess(assigned, request.companyId);
  if (request.status !== "PENDING") forbidden("This access request has already been resolved.");
  return getPrisma().companyAccessRequest.update({
    where: { id: requestId },
    data: { status: "DECLINED", resolvedAt: new Date(), resolvedBy: principal.id },
    include: { company: { select: { name: true } }, user: { select: { id: true, name: true, email: true } } },
  });
}

export async function regenerateCompanyAccessCode(principal: AppPrincipal, companyId?: string) {
  const assigned = requirePermission(principal, "company:update");
  const targetCompanyId = requireCompanyAccess(assigned, companyId);
  const company = await getPrisma().company.findUnique({ where: { id: targetCompanyId } });
  if (!company) notFound("Company not found.");
  return getPrisma().company.update({ where: { id: targetCompanyId }, data: { accessCode: generateAccessCode() } });
}
