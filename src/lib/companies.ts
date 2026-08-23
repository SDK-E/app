import { randomBytes } from "node:crypto";

import {
  AuthorizationError,
  notFound,
  requireCompanyAccess,
  requirePermission,
  requireSdkStaff,
} from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { recordUserManagementEvent } from "@/lib/users/audit";
import { slugify } from "@/lib/utils";
import {
  forbidden,
  hashInvitationToken,
  INVITATION_TTL_MS,
  normalizeEmail,
} from "@/lib/users/shared";
import type { AppPrincipal } from "@/types";

export function buildCompanySlug(name: string, suffix = randomBytes(3).toString("hex")): string {
  const base = slugify(name).slice(0, 80) || "company";
  return `${base}-${suffix}`;
}

export function generateAccessCode(): string {
  const raw = randomBytes(4).toString("hex").toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

export async function createOwnedCompany(principal: AppPrincipal, name: string) {
  if (principal.kind !== "client" && principal.kind !== "unassigned") {
    throw new AuthorizationError(
      403,
      "FORBIDDEN",
      "Only client users or unassigned users can create a company."
    );
  }
  return getPrisma().$transaction(async (transaction) => {
    const user = await transaction.user.findUniqueOrThrow({
      where: { id: principal.id },
      include: { memberships: true },
    });
    if (user.sdkStaffRole || !user.isActive) {
      throw new AuthorizationError(
        403,
        "FORBIDDEN",
        "This account is SDK staff or inactive and cannot create a company."
      );
    }
    return transaction.company.create({
      data: {
        name,
        slug: buildCompanySlug(name),
        accessCode: generateAccessCode(),
        memberships: {
          create: { userId: user.id, role: "OWNER", joinedAt: new Date() },
        },
      },
      include: { memberships: true },
    });
  });
}

export async function createSdkCompany(
  principal: AppPrincipal,
  input: { name: string; ownerEmail: string }
) {
  const assigned = requirePermission(principal, "company:create");
  if (assigned.kind !== "sdk-staff" || assigned.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  const email = normalizeEmail(input.ownerEmail);
  return getPrisma().$transaction(async (transaction) => {
    const existingUser = await transaction.user.findFirst({
      where: {
        email,
        OR: [{ sdkStaffRole: { not: null } }, { memberships: { some: {} } }],
      },
      select: { id: true, sdkStaffRole: true, memberships: { select: { id: true }, take: 1 } },
    });
    if (existingUser?.sdkStaffRole) forbidden("SDK staff accounts cannot become company owners.");
    if (existingUser?.memberships.length) forbidden("This email already belongs to a company.");
    const pending = await transaction.invitation.findFirst({
      where: { email, kind: "CLIENT", clientRole: "OWNER", acceptedAt: null, revokedAt: null },
      select: { id: true },
    });
    if (pending) forbidden("An owner invitation to this email is already pending.");
    const token = randomBytes(32).toString("base64url");
    const company = await transaction.company.create({
      data: {
        name: input.name,
        slug: buildCompanySlug(input.name),
        accessCode: generateAccessCode(),
      },
    });
    const invitation = await transaction.invitation.create({
      data: {
        tokenHash: hashInvitationToken(token),
        email,
        kind: "CLIENT",
        companyId: company.id,
        clientRole: "OWNER",
        invitedBy: principal.id,
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      },
      include: { company: true },
    });
    return { company, invitation, token };
  });
}

export async function setCompanyActive(
  principal: AppPrincipal,
  companyId: string,
  isActive: boolean
) {
  const assigned = requirePermission(principal, "company:update", companyId);
  requireCompanyAccess(assigned, companyId);
  if (assigned.kind !== "sdk-staff" || assigned.role !== "ADMIN")
    forbidden("SDK administrator access is required.");
  const company = await getPrisma().company.findUnique({ where: { id: companyId } });
  if (!company) notFound("Company not found.");
  return getPrisma().company.update({ where: { id: companyId }, data: { isActive } });
}

export async function listCompaniesForManagement(principal: AppPrincipal) {
  const staff = requireSdkStaff(principal);
  const isAdmin = staff.role === "ADMIN";
  return getPrisma().company.findMany({
    where: isAdmin ? {} : { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
      accessCode: isAdmin,
      _count: { select: { memberships: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCompanyForManagement(principal: AppPrincipal, companyId: string) {
  const staff = requireSdkStaff(principal);
  const company = await getPrisma().company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
      accessCode: staff.role === "ADMIN",
      _count: { select: { memberships: true } },
    },
  });
  if (!company) notFound("Company not found.");
  return company;
}

export async function regenerateCompanyAccessCode(principal: AppPrincipal, companyId: string) {
  const assigned = requirePermission(principal, "company:update", companyId);
  const targetCompanyId = requireCompanyAccess(assigned, companyId);
  const company = await getPrisma().company.findUnique({ where: { id: targetCompanyId } });
  if (!company) notFound("Company not found.");
  const updated = await getPrisma().company.update({
    where: { id: targetCompanyId },
    data: { accessCode: generateAccessCode() },
  });
  await recordUserManagementEvent(principal, {
    action: "access_code.regenerated",
    companyId: targetCompanyId,
    targetType: "company",
    targetId: targetCompanyId,
  });
  return updated;
}
