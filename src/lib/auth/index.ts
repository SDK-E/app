export { getAuth0Client } from "@/lib/auth/auth0";
export {
  type AuthorizationErrorCode,
  AuthorizationError,
  hasPermission,
  notFound,
  requireAssignedPrincipal,
  requireAuthenticatedUser,
  requireClientPrincipal,
  requireCompanyAccess,
  requireCompanyPageContext,
  requirePermission,
  requireSdkStaff,
  tenantWhere,
} from "@/lib/auth/authorization";
export { IdentityError, getCurrentPrincipal, resolveAppPrincipal } from "@/lib/auth/identity";
export { assignCompanyMembership, assignSdkStaffRole } from "@/lib/auth/identity-management";
export { clientRolePermissions, sdkRolePermissions } from "@/lib/auth/permissions";
