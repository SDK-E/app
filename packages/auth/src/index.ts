export { getAuth0Client } from "@platform/auth/auth0";
export {
  AuthorizationError,
  type AuthorizationErrorCode,
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
} from "@platform/auth/authorization";
export { getCurrentPrincipal, IdentityError, resolveAppPrincipal } from "@platform/auth/identity";
export { assignCompanyMembership, assignSdkStaffRole } from "@platform/auth/identity-management";
export { clientRolePermissions, sdkRolePermissions } from "@platform/auth/permissions";
