export { getAuth0Client } from "@sdk-e/auth/auth0";
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
} from "@sdk-e/auth/authorization";
export { IdentityError, getCurrentPrincipal, resolveAppPrincipal } from "@sdk-e/auth/identity";
export { assignCompanyMembership, assignSdkStaffRole } from "@sdk-e/auth/identity-management";
export { clientRolePermissions, sdkRolePermissions } from "@sdk-e/auth/permissions";
