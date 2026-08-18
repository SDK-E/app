import {
  notFound,
  requireCompanyAccess,
  requireCompanyContext,
  requirePermission,
  type CompanyContext,
} from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import type { RequestActivityType, RequestStatus } from "@/generated/prisma/client";
import type { AppPrincipal, AssignedPrincipal, Permission } from "@/types";

export function scope(principal: AppPrincipal, permission: Permission, companyId?: string) {
  return requirePermission(principal, permission, companyId);
}

export function companyScope(principal: AssignedPrincipal, companyId?: string) {
  return requireCompanyAccess(principal, companyId);
}

export async function requireActiveCompany(principal: AssignedPrincipal, companyId: string) {
  if (principal.kind === "client") return;
  const company = await getPrisma().company.findFirst({
    where: { id: companyId, isActive: true },
    select: { id: true },
  });
  if (!company) notFound("Company not found.");
}

export async function resolveCompanyContext(
  principal: AppPrincipal,
  companyId: string,
  permission: Permission
): Promise<CompanyContext> {
  const ctx = requireCompanyContext(principal, companyId, permission);
  await requireActiveCompany(ctx.principal, ctx.companyId);
  return ctx;
}

export function activity(
  companyId: string,
  actorId: string,
  type: RequestActivityType,
  fromStatus?: RequestStatus,
  toStatus?: RequestStatus
) {
  return { companyId, actorId, type, fromStatus, toStatus };
}
