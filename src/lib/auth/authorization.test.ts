import { describe, expect, it } from "vitest";

import {
  AuthorizationError,
  hasPermission,
  requireAssignedPrincipal,
  requireAuthenticatedUser,
  requireCompanyAccess,
  requireCompanyPageContext,
  requirePermission,
  requireSdkStaff,
  tenantWhere,
} from "@/lib/auth/authorization";
import type {
  AppPrincipal,
  ClientMembership,
  ClientPrincipal,
  ClientRole,
  SdkStaffPrincipal,
} from "@/types";

const membership = (role: ClientRole, companyId = "company-a"): ClientMembership => ({
  companyId,
  companyName: "Company A",
  role,
});

const client = (
  role: ClientRole,
  memberships: ClientMembership[] = [membership(role)]
): ClientPrincipal => ({
  kind: "client",
  id: "user-client",
  auth0Sub: "auth0|client",
  email: "client@example.test",
  name: "Client User",
  avatarUrl: null,
  preferredLocale: "en",
  memberships,
});

const staff = (role: SdkStaffPrincipal["role"]): SdkStaffPrincipal => ({
  kind: "sdk-staff",
  id: "user-staff",
  auth0Sub: "auth0|staff",
  email: "staff@example.test",
  name: "Staff User",
  avatarUrl: null,
  preferredLocale: "en",
  role,
});

const unassigned: AppPrincipal = {
  kind: "unassigned",
  id: "user-unassigned",
  auth0Sub: "auth0|unassigned",
  email: "unassigned@example.test",
  name: "Unassigned User",
  avatarUrl: null,
  preferredLocale: "en",
};

describe("role permissions", () => {
  it.each([
    ["OWNER", "company:update"],
    ["ADMINISTRATOR", "membership:invite"],
    ["PROJECT_MEMBER", "project:update"],
    ["BILLING", "invoice:view"],
    ["VIEWER", "project:view"],
  ] as const)("grants the expected client permission to %s", (role, permission) => {
    expect(hasPermission(client(role), permission, "company-a")).toBe(true);
  });

  it.each([
    ["OWNER", "staff:update"],
    ["ADMINISTRATOR", "company:update"],
    ["PROJECT_MEMBER", "membership:invite"],
    ["BILLING", "invoice:update"],
    ["VIEWER", "project:update"],
  ] as const)("denies an out-of-scope client permission to %s", (role, permission) => {
    expect(hasPermission(client(role), permission, "company-a")).toBe(false);
  });

  it.each([
    ["ADMIN", "staff:update"],
    ["DELIVERY", "project:update"],
    ["FINANCE", "invoice:update"],
  ] as const)("grants the expected SDK permission to %s", (role, permission) => {
    expect(hasPermission(staff(role), permission)).toBe(true);
  });

  it.each([
    ["ADMIN", "invoice:update", true],
    ["DELIVERY", "invoice:update", false],
    ["FINANCE", "project:update", false],
  ] as const)("enforces SDK permission boundaries for %s", (role, permission, expected) => {
    expect(hasPermission(staff(role), permission)).toBe(expected);
  });
});

describe("authorization boundaries", () => {
  it("rejects anonymous and unassigned users", () => {
    expect(() => requireAuthenticatedUser(null)).toThrowError(AuthorizationError);
    expect(() => requireAssignedPrincipal(unassigned)).toThrowError(AuthorizationError);
    expect(() => requirePermission(unassigned, "company:view")).toThrowError(AuthorizationError);
  });

  it("rejects insufficient SDK roles", () => {
    expect(() => requireSdkStaff(staff("FINANCE"), ["ADMIN"])).toThrowError(AuthorizationError);
  });

  it("requires an explicit company scope for client permission checks", () => {
    expect(() => hasPermission(client("OWNER"), "company:update")).toThrowError(AuthorizationError);
    expect(() => requirePermission(client("OWNER"), "company:update")).toThrowError(
      AuthorizationError
    );
  });

  it("enforces client company scope per membership", () => {
    const principal = client("OWNER", [membership("OWNER", "company-a")]);
    expect(requireCompanyAccess(principal, "company-a")).toBe("company-a");
    expect(tenantWhere(principal, { id: "resource-1" }, "company-a")).toEqual({
      id: "resource-1",
      companyId: "company-a",
    });
    expect(() => requireCompanyAccess(principal, "company-b")).toThrow(
      "Cross-company access is denied."
    );
    expect(() => requireCompanyAccess(principal)).toThrowError(AuthorizationError);
  });

  it("resolves permissions for a multi-company client by active company", () => {
    const principal = client("OWNER", [
      membership("VIEWER", "company-a"),
      membership("OWNER", "company-b"),
    ]);
    expect(hasPermission(principal, "company:update", "company-a")).toBe(false);
    expect(hasPermission(principal, "company:update", "company-b")).toBe(true);
  });

  it("requires an explicit target company for every SDK resource scope", () => {
    expect(requireCompanyAccess(staff("DELIVERY"), "company-b")).toBe("company-b");
    expect(() => requireCompanyAccess(staff("DELIVERY"))).toThrowError(AuthorizationError);
  });

  it("returns a not-found error for cross-company page access", () => {
    const principal = client("OWNER", [membership("OWNER", "company-a")]);
    expect(() => requireCompanyPageContext(principal, "company-b", "company:view")).toThrowError(
      "Company not found."
    );
  });

  it("returns a not-found error for page access without the required permission", () => {
    const principal = client("VIEWER", [membership("VIEWER", "company-a")]);
    expect(() => requireCompanyPageContext(principal, "company-a", "company:update")).toThrowError(
      "Company not found."
    );
  });

  it("keeps a missing target company as a required-company error for page access", () => {
    expect(() => requireCompanyPageContext(staff("DELIVERY"), "", "request:view")).toThrowError(
      "A target company is required for resource access."
    );
  });
});
