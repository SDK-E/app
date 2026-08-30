import { evaluateCommercialReadiness } from "@platform/providers/commercial-readiness";
import { principal } from "@platform/test-support/test-fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const provider = { findFirst: vi.fn(), update: vi.fn() };
  const providerCommercialReadiness = {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const verificationRequirement = { findMany: vi.fn() };
  const verificationRecord = { findMany: vi.fn() };
  return {
    prisma: {
      provider,
      providerCommercialReadiness,
      verificationRequirement,
      verificationRecord,
      auditEvent: { create: vi.fn() },
      $transaction: vi.fn(),
    },
    provider,
    providerCommercialReadiness,
    verificationRequirement,
    verificationRecord,
  };
});

vi.mock("@platform/db", () => ({ getPrisma: () => mocks.prisma }));
mocks.prisma.$transaction.mockImplementation(async (cb) => cb(mocks.prisma));

const baseReadiness = {
  id: "pcr-1",
  providerId: "provider-1",
  contractReady: false,
  payoutReady: false,
  taxInfoReady: false,
  lastCheckedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function setupAllReady(overrides: Partial<typeof baseReadiness> = {}) {
  setupProviderApproved();
  mocks.providerCommercialReadiness.findFirst.mockResolvedValue({
    ...baseReadiness,
    contractReady: true,
    payoutReady: true,
    taxInfoReady: true,
    ...overrides,
  });
  mocks.providerCommercialReadiness.update.mockResolvedValue(baseReadiness);
}

function setupProviderApproved() {
  mocks.provider.findFirst.mockResolvedValue({
    id: "provider-1",
    status: "APPROVED",
    commercialStatus: "NOT_READY",
  });
}

beforeEach(() => {
  for (const mock of [
    mocks.provider.findFirst,
    mocks.provider.update,
    mocks.providerCommercialReadiness.findFirst,
    mocks.providerCommercialReadiness.create,
    mocks.providerCommercialReadiness.update,
    mocks.verificationRequirement.findMany,
    mocks.verificationRecord.findMany,
    mocks.prisma.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("evaluateCommercialReadiness", () => {
  it("sets READY when all conditions met", async () => {
    setupAllReady();
    mocks.verificationRequirement.findMany.mockResolvedValue([
      { id: "req-1", type: "IDENTITY", enabled: true, required: true },
    ]);
    mocks.verificationRecord.findMany.mockResolvedValue([
      { id: "vr-1", type: "IDENTITY", status: "VERIFIED", expiresAt: null },
    ]);
    mocks.provider.update.mockResolvedValue({});

    await evaluateCommercialReadiness(principal("sdk-admin"), "provider-1");

    expect(mocks.provider.update).toHaveBeenCalledWith({
      where: { id: "provider-1" },
      data: { commercialStatus: "READY" },
    });
    expect(mocks.prisma.auditEvent.create).toHaveBeenCalled();
  });

  it("keeps NOT_READY when verification missing", async () => {
    setupAllReady();
    mocks.verificationRequirement.findMany.mockResolvedValue([
      { id: "req-1", type: "IDENTITY", enabled: true, required: true },
      { id: "req-2", type: "VAT_TAX", enabled: true, required: true },
    ]);
    mocks.verificationRecord.findMany.mockResolvedValue([
      { id: "vr-1", type: "IDENTITY", status: "VERIFIED", expiresAt: null },
    ]);

    await evaluateCommercialReadiness(principal("sdk-admin"), "provider-1");
    expect(mocks.provider.update).not.toHaveBeenCalled();
  });

  it("keeps NOT_READY when contract not ready", async () => {
    setupAllReady({ contractReady: false });
    mocks.verificationRequirement.findMany.mockResolvedValue([
      { id: "req-1", type: "IDENTITY", enabled: true, required: true },
    ]);
    mocks.verificationRecord.findMany.mockResolvedValue([
      { id: "vr-1", type: "IDENTITY", status: "VERIFIED", expiresAt: null },
    ]);

    await evaluateCommercialReadiness(principal("sdk-admin"), "provider-1");
    expect(mocks.provider.update).not.toHaveBeenCalled();
  });

  it("treats expired verification as not verified", async () => {
    setupAllReady();
    mocks.verificationRequirement.findMany.mockResolvedValue([
      { id: "req-1", type: "IDENTITY", enabled: true, required: true },
    ]);
    mocks.verificationRecord.findMany.mockResolvedValue([
      { id: "vr-1", type: "IDENTITY", status: "VERIFIED", expiresAt: new Date("2020-01-01") },
    ]);

    await evaluateCommercialReadiness(principal("sdk-admin"), "provider-1");
    expect(mocks.provider.update).not.toHaveBeenCalled();
  });

  it("skips optional requirements", async () => {
    setupAllReady();
    mocks.verificationRequirement.findMany.mockResolvedValue([
      { id: "req-1", type: "IDENTITY", enabled: true, required: true },
    ]);
    mocks.verificationRecord.findMany.mockResolvedValue([
      { id: "vr-1", type: "IDENTITY", status: "VERIFIED", expiresAt: null },
    ]);
    mocks.provider.update.mockResolvedValue({});

    await evaluateCommercialReadiness(principal("sdk-admin"), "provider-1");
    expect(mocks.provider.update).toHaveBeenCalled();
  });

  it("throws for non-approved provider", async () => {
    mocks.provider.findFirst.mockResolvedValue({
      id: "provider-1",
      status: "DRAFT",
      commercialStatus: "NOT_READY",
    });

    await expect(evaluateCommercialReadiness(principal("sdk-admin"), "provider-1")).rejects.toThrow(
      /Cannot evaluate commercial readiness/,
    );
  });

  it("throws for provider principal", async () => {
    await expect(
      evaluateCommercialReadiness(principal("provider"), "provider-1"),
    ).rejects.toThrow();
  });

  it("throws for DELIVERY role", async () => {
    await expect(
      evaluateCommercialReadiness(principal("delivery"), "provider-1"),
    ).rejects.toThrow();
  });
});
