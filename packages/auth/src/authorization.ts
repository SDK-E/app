import type {
  AppPrincipal,
  AssignedPrincipal,
  ClientMembership,
  ClientPrincipal,
  Permission,
  ProviderPrincipal,
  SdkStaffPrincipal,
  SdkStaffRole,
} from "@platform/types";

import { clientRolePermissions, sdkRolePermissions } from "@platform/auth/permissions";

export type AuthorizationErrorCode =
  "COMPANY_REQUIRED" | "FORBIDDEN" | "NOT_FOUND" | "UNASSIGNED" | "UNAUTHENTICATED";

export interface CompanyContext {
  principal: AssignedPrincipal;
  companyId: string;
}

export class AuthorizationError extends Error {
  constructor(
    public readonly statusCode: 401 | 403 | 404,
    public readonly code: AuthorizationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function getClientMembership(
  principal: ClientPrincipal,
  companyId: string,
): ClientMembership {
  const membership = principal.memberships.find((entry) => entry.companyId === companyId);
  if (!membership) {
    throw new AuthorizationError(403, "FORBIDDEN", "Cross-company access is denied.");
  }
  return membership;
}

export function requireAssignedPrincipal(principal: AppPrincipal): AssignedPrincipal {
  if (principal.kind === "unassigned") {
    throw new AuthorizationError(403, "UNASSIGNED", "Application access has not been assigned.");
  }
  return principal;
}

export function requireAuthenticatedUser(principal: AppPrincipal | null): AppPrincipal {
  if (!principal) {
    throw new AuthorizationError(401, "UNAUTHENTICATED", "Authentication is required.");
  }
  return principal;
}

export function requireClientPrincipal(principal: AppPrincipal): ClientPrincipal {
  if (principal.kind !== "client") {
    throw new AuthorizationError(403, "FORBIDDEN", "Client-company access is required.");
  }
  return principal;
}

export function requireProviderPrincipal(principal: AppPrincipal): ProviderPrincipal {
  if (principal.kind !== "provider") {
    throw new AuthorizationError(403, "FORBIDDEN", "Provider access is required.");
  }
  return principal;
}

export function requireSdkStaff(
  principal: AppPrincipal,
  allowedRoles?: readonly SdkStaffRole[],
): SdkStaffPrincipal {
  if (principal.kind !== "sdk-staff" || (allowedRoles && !allowedRoles.includes(principal.role))) {
    throw new AuthorizationError(403, "FORBIDDEN", "SDK staff access is required.");
  }
  return principal;
}

const clientScopedPermissions = new Set(
  Object.values(clientRolePermissions).flatMap((permissions) => [...permissions]),
);

export function hasPermission(
  principal: AppPrincipal,
  permission: Permission,
  companyId?: string,
): boolean {
  if (principal.kind === "unassigned") return false;
  if (principal.kind === "provider") return false;
  if (principal.kind === "client") {
    if (!companyId) {
      if (!clientScopedPermissions.has(permission)) return false;
      throw new AuthorizationError(
        403,
        "COMPANY_REQUIRED",
        "Client permission checks require a company scope.",
      );
    }
    const membership = getClientMembership(principal, companyId);
    return clientRolePermissions[membership.role].has(permission);
  }
  return sdkRolePermissions[principal.role].has(permission);
}

export function notFound(message = "Resource not found."): never {
  throw new AuthorizationError(404, "NOT_FOUND", message);
}

export function requireCompanyAccess(
  principal: AssignedPrincipal,
  requestedCompanyId?: string,
): string {
  if (!requestedCompanyId) {
    throw new AuthorizationError(
      403,
      "COMPANY_REQUIRED",
      "A target company is required for resource access.",
    );
  }
  if (principal.kind === "client") {
    getClientMembership(principal, requestedCompanyId);
  }
  return requestedCompanyId;
}

export function requireCompanyContext(
  principal: AppPrincipal,
  companyId: string,
  permission: Permission,
): CompanyContext {
  const assigned = requireAssignedPrincipal(principal);
  requireCompanyAccess(assigned, companyId);
  if (!hasPermission(assigned, permission, companyId)) {
    throw new AuthorizationError(403, "FORBIDDEN", `Missing permission: ${permission}`);
  }
  return { principal: assigned, companyId };
}

export function requireCompanyPageContext(
  principal: AppPrincipal,
  companyId: string,
  permission: Permission,
): CompanyContext {
  try {
    return requireCompanyContext(principal, companyId, permission);
  } catch (error) {
    if (error instanceof AuthorizationError && error.code === "FORBIDDEN") {
      notFound("Company not found.");
    }
    throw error;
  }
}

export function requirePermission(
  principal: AppPrincipal,
  permission: Permission,
  companyId?: string,
): AssignedPrincipal {
  const assigned = requireAssignedPrincipal(principal);
  if (!hasPermission(assigned, permission, companyId)) {
    throw new AuthorizationError(403, "FORBIDDEN", `Missing permission: ${permission}`);
  }
  return assigned;
}

export function tenantWhere<T extends object>(
  principal: AssignedPrincipal,
  where: T,
  companyId?: string,
): { companyId: string } & T {
  return { ...where, companyId: requireCompanyAccess(principal, companyId) };
}
