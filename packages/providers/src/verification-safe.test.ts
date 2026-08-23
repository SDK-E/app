import { describe, expect, it } from "vitest";
import { selectVerificationSafe } from "@sdk-e/providers/verification";
import { principal } from "@sdk-e/test-support/test-fixtures";
import type { VerificationRecord, VerificationEvidence } from "@sdk-e/db/client";

const SENSITIVE_RECORD: VerificationRecord & { evidence: VerificationEvidence[] } = {
  id: "vr-1",
  providerId: "provider-1",
  type: "IDENTITY",
  status: "VERIFIED",
  verifiedAt: new Date("2026-01-15"),
  expiresAt: new Date("2027-01-15"),
  verifiedById: "staff-user-1",
  rejectionReason: "Previous submission was blurry",
  internalNotes: "Provider provided high-quality scan on second attempt",
  createdAt: new Date("2026-01-10"),
  updatedAt: new Date("2026-01-15"),
  evidence: [],
};

describe("selectVerificationSafe — field-level access control", () => {
  const SENSITIVE_FIELDS = ["internalNotes", "rejectionReason", "verifiedById"] as const;

  it.each([
    ["sdk-admin", "ADMIN"],
    ["delivery", "DELIVERY"],
  ])("%s (%s role) can see all sensitive fields", (kind) => {
    const p = kind === "sdk-admin" ? principal("sdk-admin") : principal("delivery");
    const result = selectVerificationSafe(p, SENSITIVE_RECORD);

    for (const field of SENSITIVE_FIELDS) {
      expect(result).toHaveProperty(field);
      expect(result[field]).toBe(SENSITIVE_RECORD[field as keyof typeof SENSITIVE_RECORD]);
    }
  });

  it("provider cannot see internalNotes", () => {
    const result = selectVerificationSafe(principal("provider"), SENSITIVE_RECORD);
    expect(result).not.toHaveProperty("internalNotes");
  });

  it("provider cannot see rejectionReason", () => {
    const result = selectVerificationSafe(principal("provider"), SENSITIVE_RECORD);
    expect(result).not.toHaveProperty("rejectionReason");
  });

  it("provider cannot see verifiedById", () => {
    const result = selectVerificationSafe(principal("provider"), SENSITIVE_RECORD);
    expect(result).not.toHaveProperty("verifiedById");
  });

  it("SDK FINANCE cannot see sensitive fields", () => {
    const finance = {
      ...principal("sdk-admin"),
      kind: "sdk-staff" as const,
      role: "FINANCE" as const,
    };
    const result = selectVerificationSafe(finance, SENSITIVE_RECORD);
    expect(result).not.toHaveProperty("internalNotes");
    expect(result).not.toHaveProperty("rejectionReason");
    expect(result).not.toHaveProperty("verifiedById");
  });

  it("all roles receive base fields", () => {
    const roles = [
      principal("provider"),
      principal("sdk-admin"),
      principal("delivery"),
      { ...principal("sdk-admin"), kind: "sdk-staff" as const, role: "FINANCE" as const },
    ];

    for (const p of roles) {
      const result = selectVerificationSafe(p, SENSITIVE_RECORD);
      expect(result.id).toBe("vr-1");
      expect(result.type).toBe("IDENTITY");
      expect(result.status).toBe("VERIFIED");
      expect(result.verifiedAt).toEqual(new Date("2026-01-15"));
      expect(result.expiresAt).toEqual(new Date("2027-01-15"));
      expect(result.createdAt).toEqual(new Date("2026-01-10"));
    }
  });
});
