import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  initializeVerificationRecords,
  getProviderVerificationSummary,
} from "@sdk-e/providers/verification-records";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const verificationRequirement = { findMany: vi.fn() };
  const verificationRecord = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  };
  const provider = { findFirst: vi.fn() };
  return {
    prisma: {
      verificationRequirement,
      verificationRecord,
      verificationEvidence: { create: vi.fn(), findFirst: vi.fn() },
      provider,
      auditEvent: { create: vi.fn() },
      $transaction: vi.fn(),
    },
    verificationRequirement,
    verificationRecord,
    provider,
    auditEvent: { create: vi.fn() },
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));
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

beforeEach(() => {
  for (const mock of [
    mocks.verificationRequirement.findMany,
    mocks.verificationRecord.create,
    mocks.verificationRecord.findFirst,
    mocks.verificationRecord.findMany,
    mocks.verificationRecord.update,
    mocks.provider.findFirst,
    mocks.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("initializeVerificationRecords", () => {
  it("creates records for missing types", async () => {
    mocks.verificationRequirement.findMany.mockResolvedValue([
      { id: "req-1", type: "IDENTITY", enabled: true },
      { id: "req-2", type: "VAT_TAX", enabled: true },
    ]);
    mocks.verificationRecord.findMany.mockResolvedValue([{ type: "IDENTITY" }]);
    mocks.verificationRecord.create.mockResolvedValue({ ...baseRecord, type: "VAT_TAX" });

    const result = await initializeVerificationRecords(principal("sdk-admin"), "provider-1");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("VAT_TAX");
  });

  it("returns empty when all types exist", async () => {
    mocks.verificationRequirement.findMany.mockResolvedValue([
      { id: "req-1", type: "IDENTITY", enabled: true },
    ]);
    mocks.verificationRecord.findMany.mockResolvedValue([{ type: "IDENTITY" }]);

    const result = await initializeVerificationRecords(principal("sdk-admin"), "provider-1");
    expect(result).toHaveLength(0);
  });

  it("throws for provider principal", async () => {
    await expect(
      initializeVerificationRecords(principal("provider"), "provider-1")
    ).rejects.toThrow();
  });
});

describe("getProviderVerificationSummary", () => {
  it("returns records for own data", async () => {
    mocks.verificationRecord.findMany.mockResolvedValue([{ ...baseRecord, evidence: [] }]);

    const result = await getProviderVerificationSummary(principal("provider"), "provider-1");
    expect(result).toHaveLength(1);
  });

  it("throws when provider accesses another's data", async () => {
    await expect(
      getProviderVerificationSummary(principal("provider"), "provider-2")
    ).rejects.toThrow();
  });

  it("throws for client principal", async () => {
    await expect(
      getProviderVerificationSummary(principal("owner"), "provider-1")
    ).rejects.toThrow();
  });
});
