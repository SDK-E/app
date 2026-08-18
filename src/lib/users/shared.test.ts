import { describe, expect, it } from "vitest";

import { canManageUsers, hashInvitationToken } from "@/lib/users";
import { principal } from "@/lib/users/test-fixtures";

describe("user management policies", () => {
  it.each([
    ["owner", true],
    ["administrator", true],
    ["member", false],
    ["sdk-admin", true],
    ["delivery", false],
    ["unassigned", false],
  ] as const)("exposes management only to authorized %s principals", (kind, expected) => {
    expect(canManageUsers(principal(kind), "company-1")).toBe(expected);
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
