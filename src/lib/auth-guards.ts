export {
  AuthorizationError as AuthError,
  hasPermission,
  requireAssignedPrincipal,
  requireAuthenticatedUser as requireAuth,
  requireClientPrincipal,
  requireCompanyAccess,
  requirePermission,
  requireSdkStaff,
  tenantWhere,
} from "@/lib/authorization";
