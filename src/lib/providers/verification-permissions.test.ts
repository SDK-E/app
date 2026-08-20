import { describe, expect, it } from "vitest";
import { selectVerificationSafe } from "@/lib/providers/verification";
import { principal } from "@/lib/users/test-fixtures";
import type { VerificationRecord, VerificationEvidence } from "@/generated/prisma/client";

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

const SENSITIVE_FIELDS = ["internalNotes", "rejectionReason", "verifiedById"] as const;

describe("selectVerificationSafe — field-level access control", () => {
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

  it("provider cannot see sensitive fields", () => {
    const result = selectVerificationSafe(principal("provider"), SENSITIVE_RECORD);
    for (const field of SENSITIVE_FIELDS) {
      expect(result).not.toHaveProperty(field);
    }
  });

  it("SDK FINANCE cannot see sensitive fields", () => {
    const finance = {
      ...principal("sdk-admin"),
      kind: "sdk-staff" as const,
      role: "FINANCE" as const,
    };
    const result = selectVerificationSafe(finance, SENSITIVE_RECORD);
    for (const field of SENSITIVE_FIELDS) {
      expect(result).not.toHaveProperty(field);
    }
  });
});
