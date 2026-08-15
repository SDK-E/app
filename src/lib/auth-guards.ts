import type { SessionData } from "@auth0/nextjs-auth0/types";
import type { UserRole } from "@/types";

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function requireAuth(session: SessionData | null): SessionData {
  if (!session) {
    throw new AuthError(401, "Unauthorized: No active session");
  }
  return session;
}

export function requireRole(session: SessionData, allowedRoles: UserRole[]): void {
  const userRole = (session.user as unknown as { role?: UserRole })?.role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new AuthError(403, `Forbidden: Requires one of roles: ${allowedRoles.join(", ")}`);
  }
}

export function requireCompanyAccess(session: SessionData, companyId: string): void {
  const userCompanyId = (session.user as unknown as { companyId?: string })?.companyId;
  if (!userCompanyId || userCompanyId !== companyId) {
    throw new AuthError(403, `Forbidden: Access to company ${companyId} is denied`);
  }
}
