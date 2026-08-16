import { describe, expect, it } from "vitest";

import { canManageUsers, hashInvitationToken } from "@/lib/user-management";
import type { AppPrincipal } from "@/types";

const common = {
  id: "user-1",
  auth0Sub: "auth0|1",
  email: "user@example.test",
  name: "User",
  avatarUrl: null,
  preferredLocale: "en",
};

function principal(
  kind: "owner" | "administrator" | "member" | "sdk-admin" | "delivery" | "unassigned"
): AppPrincipal {
  if (kind === "unassigned") return { ...common, kind: "unassigned" };
  if (kind === "sdk-admin" || kind === "delivery")
    return { ...common, kind: "sdk-staff", role: kind === "sdk-admin" ? "ADMIN" : "DELIVERY" };
  return {
    ...common,
    kind: "client",
    companyId: "company-1",
    companyName: "Company",
    role:
      kind === "owner" ? "OWNER" : kind === "administrator" ? "ADMINISTRATOR" : "PROJECT_MEMBER",
  };
}

describe("user management policies", () => {
  it.each([
    ["owner", true],
    ["administrator", true],
    ["member", false],
    ["sdk-admin", true],
    ["delivery", false],
    ["unassigned", false],
  ] as const)("exposes management only to authorized %s principals", (kind, expected) => {
    expect(canManageUsers(principal(kind))).toBe(expected);
  });

  it("hashes invitation tokens deterministically without retaining the raw token", () => {
    const raw = "single-use-secret";
    const hash = hashInvitationToken(raw);
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(raw);
    expect(hashInvitationToken(raw)).toBe(hash);
    expect(hashInvitationToken(`${raw}-other`)).not.toBe(hash);
  });
});
