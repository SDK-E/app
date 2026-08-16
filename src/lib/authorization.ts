import { clientRolePermissions, sdkRolePermissions } from "@/lib/permissions";
import type {
  AppPrincipal,
  AssignedPrincipal,
  ClientPrincipal,
  Permission,
  SdkStaffPrincipal,
  SdkStaffRole,
  ServiceProviderPrincipal,
} from "@/types";

export type AuthorizationErrorCode =
  | "UNAUTHENTICATED"
  | "UNASSIGNED"
  | "FORBIDDEN"
  | "COMPANY_REQUIRED"
  | "NOT_FOUND";

export class AuthorizationError extends Error {
  constructor(
    public readonly statusCode: 401 | 403 | 404,
    public readonly code: AuthorizationErrorCode,
    message: string
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function requireAuthenticatedUser(principal: AppPrincipal | null): AppPrincipal {
  if (!principal) {
    throw new AuthorizationError(401, "UNAUTHENTICATED", "Authentication is required.");
  }
  return principal;
}

export function requireAssignedPrincipal(principal: AppPrincipal): AssignedPrincipal {
  if (principal.kind === "unassigned") {
    throw new AuthorizationError(403, "UNASSIGNED", "Application access has not been assigned.");
  }
  return principal;
}

export function requireClientPrincipal(principal: AppPrincipal): ClientPrincipal {
  if (principal.kind !== "client") {
    throw new AuthorizationError(403, "FORBIDDEN", "Client-company access is required.");
  }
  return principal;
}

export function requireSdkStaff(
  principal: AppPrincipal,
  allowedRoles?: readonly SdkStaffRole[]
): SdkStaffPrincipal {
  if (
    principal.kind !== "sdk-staff" ||
    (allowedRoles && !allowedRoles.includes(principal.role))
  ) {
    throw new AuthorizationError(403, "FORBIDDEN", "SDK staff access is required.");
  }
  return principal;
}

export function requireServiceProvider(principal: AppPrincipal): ServiceProviderPrincipal {
  if (principal.kind !== "service-provider") {
    throw new AuthorizationError(403, "FORBIDDEN", "Service-provider access is required.");
  }
  return principal;
}

export function requireActiveServiceProvider(principal: AppPrincipal): ServiceProviderPrincipal {
  const provider = requireServiceProvider(principal);
  if (provider.status !== "ACTIVE") {
    throw new AuthorizationError(403, "FORBIDDEN", "An active service-provider account is required.");
  }
  return provider;
}

export function hasPermission(principal: AppPrincipal, permission: Permission): boolean {
  if (principal.kind === "unassigned") return false;
  if (principal.kind === "service-provider") return false;
  const rolePermissions =
    principal.kind === "client"
      ? clientRolePermissions[principal.role]
      : sdkRolePermissions[principal.role];
  return rolePermissions.has(permission);
}

export function requirePermission(
  principal: AppPrincipal,
  permission: Permission
): AssignedPrincipal {
  const assigned = requireAssignedPrincipal(principal);
  if (!hasPermission(assigned, permission)) {
    throw new AuthorizationError(403, "FORBIDDEN", `Missing permission: ${permission}`);
  }
  return assigned;
}

export function requireCompanyAccess(
  principal: AssignedPrincipal,
  requestedCompanyId?: string
): string {
  if (principal.kind === "client") {
    if (requestedCompanyId && requestedCompanyId !== principal.companyId) {
      throw new AuthorizationError(403, "FORBIDDEN", "Cross-company access is denied.");
    }
    return principal.companyId;
  }


  if (principal.kind === "service-provider") {
    throw new AuthorizationError(403, "FORBIDDEN", "Providers do not have company-wide access.");
  }

  if (!requestedCompanyId) {
    throw new AuthorizationError(403, "COMPANY_REQUIRED", "SDK staff must select a target company.");
  }
  return requestedCompanyId;
}

export function tenantWhere<T extends object>(
  principal: AssignedPrincipal,
  where: T,
  requestedCompanyId?: string
): T & { companyId: string } {
  return { ...where, companyId: requireCompanyAccess(principal, requestedCompanyId) };
}

export function notFound(message = "Resource not found."): never {
  throw new AuthorizationError(404, "NOT_FOUND", message);
}
