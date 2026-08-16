import { createHash, randomBytes } from "node:crypto";

import { getPrisma } from "@/lib/db";
import { AuthorizationError, requirePermission } from "@/lib/authorization";
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
    const [memberships, invitations] = await Promise.all([
      db.membership.findMany({
        where: { companyId: principal.companyId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      }),
      db.invitation.findMany({
        where: { companyId: principal.companyId, acceptedAt: null, revokedAt: null },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { kind: "client" as const, companies: [], memberships, invitations, users: [] };
  }
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  const [users, companies, invitations] = await Promise.all([
    db.user.findMany({ include: { memberships: { include: { company: true } } }, orderBy: { createdAt: "desc" } }),
    db.company.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.invitation.findMany({ include: { company: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return { kind: "staff" as const, users, companies, invitations, memberships: [] };
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

export async function createProviderInvitation(principal: AppPrincipal, applicationId: string) {
  requirePermission(principal, "provider:create");
  if (principal.kind !== "sdk-staff" || principal.role !== "ADMIN") forbidden("SDK administrator access is required.");
  const application = await getPrisma().providerApplication.findUniqueOrThrow({ where: { id: applicationId } });
  if (application.rejectedAt) forbidden("A rejected application cannot be invited.");
  const token = randomBytes(32).toString("base64url");
  const invitation = await getPrisma().invitation.create({
    data: {
      tokenHash: hashInvitationToken(token),
      email: application.email,
      kind: "SERVICE_PROVIDER",
      providerApplicationId: application.id,
      invitedBy: principal.id,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    },
  });
  await getPrisma().providerApplication.update({ where: { id: application.id }, data: { reviewedAt: new Date(), reviewedBy: principal.id, invitedAt: new Date() } });
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
  if (!input.emailVerified) forbidden("Verify your email with Auth0 before accepting this invitation.");
  return getPrisma().$transaction(async db => {
    const invitation = await db.invitation.findUnique({ where: { tokenHash: hashInvitationToken(input.token) } });
    if (!invitation || invitation.revokedAt || invitation.acceptedAt || invitation.expiresAt <= new Date()) forbidden("This invitation is invalid or has expired.");
    if (invitation.email !== input.email.trim().toLowerCase()) forbidden("Sign in with the email address that received this invitation.");
    const user = await db.user.findUniqueOrThrow({ where: { id: input.userId }, include: { memberships: true, providerProfile: true } });
    if (user.sdkStaffRole || user.memberships.length || user.providerProfile) forbidden("This account already has an application assignment.");
    if (invitation.kind === "CLIENT" && invitation.companyId && invitation.clientRole) {
      await db.membership.create({ data: { userId: user.id, companyId: invitation.companyId, role: invitation.clientRole, invitedBy: invitation.invitedBy, invitedAt: invitation.createdAt, joinedAt: new Date() } });
    } else if (invitation.kind === "SDK_STAFF" && invitation.sdkStaffRole) {
      await db.user.update({ where: { id: user.id }, data: { sdkStaffRole: invitation.sdkStaffRole } });
    } else if (invitation.kind === "SERVICE_PROVIDER" && invitation.providerApplicationId) {
      const application = await db.providerApplication.findUniqueOrThrow({ where: { id: invitation.providerApplicationId } });
      await db.serviceProviderProfile.create({
        data: {
          userId: user.id,
          status: "ONBOARDING",
          professionalHeadline: application.professionalHeadline,
          professionalEmail: application.email,
          countryCode: application.countryCode,
          taxResidenceCode: application.countryCode,
        },
      });
    } else forbidden("This invitation has an invalid target.");
    await db.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date(), acceptedBy: user.id } });
    return invitation;
  });
}

export async function getInvitationPreview(token: string) {
  return getPrisma().invitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
    select: { email: true, kind: true, clientRole: true, sdkStaffRole: true, expiresAt: true, acceptedAt: true, revokedAt: true, company: { select: { name: true } } },
  });
}
