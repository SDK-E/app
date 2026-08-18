import {
  notFound,
  requireCompanyContext,
  requireCompanyAccess,
  requirePermission,
} from "@/lib/auth/authorization";
import { assignCompanyMembership } from "@/lib/auth/identity-management";
import { getPrisma } from "@/lib/db";
import { assertClientRoleGrant, canManageUsers, forbidden } from "@/lib/users/shared";
import type { CompanyAccessRequestStatus } from "@/generated/prisma/client";
import type { AppPrincipal, ClientRole } from "@/types";

export async function getUserAccessRequests(principal: AppPrincipal) {
  return getPrisma().companyAccessRequest.findMany({
    where: { userId: principal.id },
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function requestCompanyAccess(
  principal: AppPrincipal,
  input: { code: string; requestedRole?: ClientRole }
) {
  if (principal.kind !== "unassigned")
    forbidden("Only unassigned users may request company access.");
  const requestedRole = input.requestedRole ?? "VIEWER";
  if (requestedRole === "OWNER" || requestedRole === "ADMINISTRATOR")
    forbidden("Ownership and administrator access cannot be requested.");
  const code = input.code.trim().toUpperCase();
  if (!code) forbidden("Enter a company access code.");
  const company = await getPrisma().company.findFirst({
    where: { accessCode: code, isActive: true },
  });
  if (!company) forbidden("That access code was not found. Check the code and try again.");
  const existing = await getPrisma().membership.findFirst({
    where: { userId: principal.id, companyId: company.id },
    select: { id: true },
  });
  if (existing) forbidden("You are already a member of that company.");
  const pending = await getPrisma().companyAccessRequest.findFirst({
    where: { userId: principal.id, companyId: company.id, status: "PENDING" },
  });
  if (pending) forbidden("You already have a pending access request for this company.");
  return getPrisma().companyAccessRequest.create({
    data: { userId: principal.id, companyId: company.id, requestedRole },
    include: { company: { select: { name: true } } },
  });
}

export async function listCompanyAccessRequests(
  principal: AppPrincipal,
  input?: { companyId?: string; status?: CompanyAccessRequestStatus }
) {
  const companyId = input?.companyId;
  requirePermission(principal, "membership:update", companyId);
  if (!canManageUsers(principal, companyId))
    forbidden("User management is not available for this role.");
  const status = input?.status ?? "PENDING";
  const include = {
    user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    company: { select: { name: true } },
  };
  if (principal.kind === "client") {
    const scopedCompanyId = requireCompanyAccess(principal, companyId);
    return getPrisma().companyAccessRequest.findMany({
      where: { companyId: scopedCompanyId, status },
      include,
      orderBy: { createdAt: "desc" },
    });
  }
  return getPrisma().companyAccessRequest.findMany({
    where: { companyId: companyId, status },
    include,
    orderBy: { createdAt: "desc" },
  });
}

export async function approveCompanyAccessRequest(
  principal: AppPrincipal,
  requestId: string,
  input: { role?: ClientRole }
) {
  const role = input.role ?? "VIEWER";
  if (role === "OWNER") forbidden("Ownership cannot be granted from user management.");
  const request = await getPrisma().companyAccessRequest.findUnique({
    where: { id: requestId },
    include: { user: { select: { sdkStaffRole: true } } },
  });
  if (!request) notFound("Access request not found.");
  const context = requireCompanyContext(principal, request.companyId, "membership:update");
  if (!canManageUsers(context.principal, context.companyId))
    forbidden("User management is not available for this role.");
  assertClientRoleGrant(context.principal, role, context.companyId);
  if (request.status !== "PENDING") forbidden("This access request has already been resolved.");
  if (request.user.sdkStaffRole)
    forbidden("This user is SDK staff and cannot receive company access.");
  const existing = await getPrisma().membership.findFirst({
    where: { userId: request.userId, companyId: request.companyId },
  });
  if (existing) forbidden("This user is already a member of this company.");
  const membership = await assignCompanyMembership({
    userId: request.userId,
    companyId: request.companyId,
    role,
    invitedBy: principal.id,
  });
  const updated = await getPrisma().companyAccessRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", resolvedAt: new Date(), resolvedBy: principal.id },
    include: {
      company: { select: { name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return { request: updated, membership };
}

export async function declineCompanyAccessRequest(principal: AppPrincipal, requestId: string) {
  const request = await getPrisma().companyAccessRequest.findUnique({ where: { id: requestId } });
  if (!request) notFound("Access request not found.");
  const context = requireCompanyContext(principal, request.companyId, "membership:update");
  if (!canManageUsers(context.principal, context.companyId))
    forbidden("User management is not available for this role.");
  if (request.status !== "PENDING") forbidden("This access request has already been resolved.");
  return getPrisma().companyAccessRequest.update({
    where: { id: requestId },
    data: { status: "DECLINED", resolvedAt: new Date(), resolvedBy: principal.id },
    include: {
      company: { select: { name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
