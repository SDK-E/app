import { describe, expect, it } from "vitest";

import {
  AuthorizationError,
  hasPermission,
  requireAssignedPrincipal,
  requireAuthenticatedUser,
  requireCompanyAccess,
  requirePermission,
  requireSdkStaff,
  tenantWhere,
} from "@/lib/authorization";
import type { AppPrincipal, ClientPrincipal, SdkStaffPrincipal } from "@/types";

const client = (role: ClientPrincipal["role"], companyId = "company-a"): ClientPrincipal => ({
  kind: "client",
  id: "user-client",
  auth0Sub: "auth0|client",
  email: "client@example.test",
  name: "Client User",
  avatarUrl: null,
  companyId,
  companyName: "Company A",
  role,
});

const staff = (role: SdkStaffPrincipal["role"]): SdkStaffPrincipal => ({
  kind: "sdk-staff",
  id: "user-staff",
  auth0Sub: "auth0|staff",
  email: "staff@example.test",
  name: "Staff User",
  avatarUrl: null,
  role,
});

const unassigned: AppPrincipal = {
  kind: "unassigned",
  id: "user-unassigned",
  auth0Sub: "auth0|unassigned",
  email: "unassigned@example.test",
  name: "Unassigned User",
  avatarUrl: null,
};

describe("role permissions", () => {
  it.each([
    ["OWNER", "company:update"],
    ["ADMINISTRATOR", "membership:invite"],
    ["PROJECT_MEMBER", "project:update"],
    ["BILLING", "invoice:view"],
    ["VIEWER", "project:view"],
  ] as const)("grants the expected client permission to %s", (role, permission) => {
    expect(hasPermission(client(role), permission)).toBe(true);
  });

  it.each([
    ["OWNER", "staff:update"],
    ["ADMINISTRATOR", "company:update"],
    ["PROJECT_MEMBER", "membership:invite"],
    ["BILLING", "invoice:update"],
    ["VIEWER", "project:update"],
  ] as const)("denies an out-of-scope client permission to %s", (role, permission) => {
    expect(hasPermission(client(role), permission)).toBe(false);
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

  it("derives client company scope and rejects cross-company access", () => {
    const principal = client("OWNER");
    expect(requireCompanyAccess(principal)).toBe("company-a");
    expect(tenantWhere(principal, { id: "resource-1" })).toEqual({
      id: "resource-1",
      companyId: "company-a",
    });
    expect(() => requireCompanyAccess(principal, "company-b")).toThrowError(AuthorizationError);
  });

  it("requires an explicit target company for every SDK resource scope", () => {
    expect(requireCompanyAccess(staff("DELIVERY"), "company-b")).toBe("company-b");
    expect(() => requireCompanyAccess(staff("DELIVERY"))).toThrowError(AuthorizationError);
  });
});
