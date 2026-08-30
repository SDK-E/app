import type { AppPrincipal, ClientRole } from "@platform/types";

import { AuthorizationError, getClientMembership } from "@platform/auth/authorization";
import { createHash } from "node:crypto";

export const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function assertClientRoleGrant(
  principal: AppPrincipal,
  role: ClientRole,
  companyId?: string,
) {
  if (role === "OWNER") forbidden("Ownership cannot be granted from user management.");
  if (role === "ADMINISTRATOR") {
    const grantsAdministrator =
      principal.kind === "sdk-staff" ||
      (principal.kind === "client" &&
        !!companyId &&
        getClientMembership(principal, companyId).role === "OWNER");
    if (!grantsAdministrator) {
      forbidden("Only a company owner can grant administrator access.");
    }
  }
}

export function canManageUsers(principal: AppPrincipal, companyId?: string): boolean {
  if (principal.kind === "sdk-staff") return principal.role === "ADMIN";
  if (principal.kind !== "client" || !companyId) return false;
  return ["OWNER", "ADMINISTRATOR"].includes(getClientMembership(principal, companyId).role);
}

export function forbidden(message: string): never {
  throw new AuthorizationError(403, "FORBIDDEN", message);
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
