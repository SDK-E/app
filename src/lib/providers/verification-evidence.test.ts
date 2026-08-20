import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  submitEvidence,
  reviewVerification,
  getVerificationEvidence,
} from "@/lib/providers/verification-evidence";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const verificationRecord = { findFirst: vi.fn(), update: vi.fn() };
  const verificationEvidence = { create: vi.fn(), findFirst: vi.fn() };
  const provider = { findFirst: vi.fn() };
  return {
    prisma: {
      verificationRecord,
      verificationEvidence,
      provider,
      auditEvent: { create: vi.fn() },
      $transaction: vi.fn(),
    },
    verificationRecord,
    verificationEvidence,
    provider,
  };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));
mocks.prisma.$transaction.mockImplementation(async (cb) => cb(mocks.prisma));

const baseRecord = {
  id: "vr-1",
  providerId: "provider-1",
  type: "IDENTITY" as const,
  status: "NOT_STARTED" as const,
  verifiedAt: null,
  expiresAt: null,
  verifiedById: null,
  rejectionReason: null,
  internalNotes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseEvidence = {
  id: "ve-1",
  verificationId: "vr-1",
  name: "passport.pdf",
  storageKey: "evidence/passport.pdf",
  mimeType: "application/pdf",
  sizeBytes: 1024,
  contentHash: null,
  status: "UPLOADED" as const,
  uploadedBy: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  for (const mock of [
    mocks.verificationRecord.findFirst,
    mocks.verificationRecord.update,
    mocks.verificationEvidence.create,
    mocks.verificationEvidence.findFirst,
    mocks.provider.findFirst,
    mocks.prisma.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("submitEvidence", () => {
  it("submits for own record", async () => {
    mocks.verificationRecord.findFirst.mockResolvedValue({
      ...baseRecord,
      provider: { userId: "user-1" },
    });
    mocks.verificationEvidence.create.mockResolvedValue(baseEvidence);
    mocks.verificationRecord.update.mockResolvedValue({ ...baseRecord, status: "PENDING" });

    const result = await submitEvidence(principal("provider"), "vr-1", {
      name: "passport.pdf",
      storageKey: "evidence/passport.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
    });

    expect(result.name).toBe("passport.pdf");
    expect(mocks.prisma.auditEvent.create).toHaveBeenCalled();
  });

  it("throws for another provider's record", async () => {
    mocks.verificationRecord.findFirst.mockResolvedValue({
      ...baseRecord,
      provider: { userId: "user-other" },
    });

    await expect(
      submitEvidence(principal("provider"), "vr-1", {
        name: "passport.pdf",
        storageKey: "evidence/passport.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
      })
    ).rejects.toThrow();
  });

  it("throws when verification is VERIFIED", async () => {
    mocks.verificationRecord.findFirst.mockResolvedValue({
      ...baseRecord,
      status: "VERIFIED",
      provider: { userId: "user-1" },
    });

    await expect(
      submitEvidence(principal("provider"), "vr-1", {
        name: "passport.pdf",
        storageKey: "evidence/passport.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
      })
    ).rejects.toThrow(/Cannot submit evidence/);
  });
});

describe("reviewVerification", () => {
  it("approves", async () => {
    mocks.verificationRecord.findFirst.mockResolvedValue({ ...baseRecord, status: "PENDING" });
    mocks.verificationRecord.update.mockResolvedValue({ ...baseRecord, status: "VERIFIED" });

    const result = await reviewVerification(principal("sdk-admin"), "vr-1", {
      decision: "approve",
    });
    expect(result.status).toBe("VERIFIED");
  });

  it("rejects with reason", async () => {
    mocks.verificationRecord.findFirst.mockResolvedValue({ ...baseRecord, status: "PENDING" });
    mocks.verificationRecord.update.mockResolvedValue({ ...baseRecord, status: "FAILED" });

    const result = await reviewVerification(principal("sdk-admin"), "vr-1", {
      decision: "reject",
      rejectionReason: "Document is blurry.",
    });
    expect(result.status).toBe("FAILED");
  });

  it("waives", async () => {
    mocks.verificationRecord.findFirst.mockResolvedValue({ ...baseRecord, status: "PENDING" });
    mocks.verificationRecord.update.mockResolvedValue({ ...baseRecord, status: "WAIVED" });

    const result = await reviewVerification(principal("sdk-admin"), "vr-1", {
      decision: "waive",
      reason: "Not applicable.",
    });
    expect(result.status).toBe("WAIVED");
  });

  it("throws on invalid transition", async () => {
    mocks.verificationRecord.findFirst.mockResolvedValue({ ...baseRecord, status: "WAIVED" });

    await expect(
      reviewVerification(principal("sdk-admin"), "vr-1", { decision: "approve" })
    ).rejects.toThrow(/Invalid verification transition/);
  });

  it("allows DELIVERY role", async () => {
    mocks.verificationRecord.findFirst.mockResolvedValue({ ...baseRecord, status: "PENDING" });
    mocks.verificationRecord.update.mockResolvedValue({ ...baseRecord, status: "VERIFIED" });

    const result = await reviewVerification(principal("delivery"), "vr-1", { decision: "approve" });
    expect(result.status).toBe("VERIFIED");
  });
});

describe("getVerificationEvidence", () => {
  it("returns own evidence", async () => {
    mocks.verificationEvidence.findFirst.mockResolvedValue({
      ...baseEvidence,
      verification: { providerId: "provider-1" },
    });
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });

    const result = await getVerificationEvidence(principal("provider"), "ve-1");
    expect(result.id).toBe("ve-1");
  });

  it("throws for another provider's evidence", async () => {
    mocks.verificationEvidence.findFirst.mockResolvedValue({
      ...baseEvidence,
      verification: { providerId: "provider-other" },
    });
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });

    await expect(getVerificationEvidence(principal("provider"), "ve-1")).rejects.toThrow();
  });
});
