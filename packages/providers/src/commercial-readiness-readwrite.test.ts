import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCommercialReadiness,
  updateReadinessComponent,
} from "@sdk-e/providers/commercial-readiness";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const provider = { findFirst: vi.fn() };
  const providerCommercialReadiness = {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  return {
    prisma: {
      provider,
      providerCommercialReadiness,
      auditEvent: { create: vi.fn() },
    },
    provider,
    providerCommercialReadiness,
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));

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

beforeEach(() => {
  for (const mock of [
    mocks.provider.findFirst,
    mocks.providerCommercialReadiness.findFirst,
    mocks.providerCommercialReadiness.create,
    mocks.providerCommercialReadiness.update,
    mocks.prisma.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("getCommercialReadiness", () => {
  it("returns readiness for own data", async () => {
    mocks.provider.findFirst
      .mockResolvedValueOnce({ id: "provider-1", userId: "user-1" })
      .mockResolvedValueOnce({ commercialStatus: "NOT_READY" });
    mocks.providerCommercialReadiness.findFirst.mockResolvedValue(baseReadiness);

    const result = await getCommercialReadiness(principal("provider"), "provider-1");
    expect(result.commercialStatus).toBe("NOT_READY");
  });

  it("creates readiness if missing", async () => {
    mocks.provider.findFirst
      .mockResolvedValueOnce({ id: "provider-1", userId: "user-1" })
      .mockResolvedValueOnce({ commercialStatus: "NOT_READY" });
    mocks.providerCommercialReadiness.findFirst.mockResolvedValue(null);
    mocks.providerCommercialReadiness.create.mockResolvedValue(baseReadiness);

    await getCommercialReadiness(principal("provider"), "provider-1");
    expect(mocks.providerCommercialReadiness.create).toHaveBeenCalled();
  });

  it("throws when provider accesses another's data", async () => {
    mocks.provider.findFirst.mockResolvedValueOnce(null);

    await expect(getCommercialReadiness(principal("provider"), "provider-2")).rejects.toThrow();
  });

  it("returns for SDK ADMIN", async () => {
    mocks.provider.findFirst.mockResolvedValue({ commercialStatus: "READY" });
    mocks.providerCommercialReadiness.findFirst.mockResolvedValue({
      ...baseReadiness,
      contractReady: true,
    });

    const result = await getCommercialReadiness(principal("sdk-admin"), "provider-1");
    expect(result.commercialStatus).toBe("READY");
  });

  it("throws for client principal", async () => {
    await expect(getCommercialReadiness(principal("owner"), "provider-1")).rejects.toThrow();
  });
});

describe("updateReadinessComponent", () => {
  it("updates contractReady", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });
    mocks.providerCommercialReadiness.findFirst.mockResolvedValue(baseReadiness);
    mocks.providerCommercialReadiness.update.mockResolvedValue({
      ...baseReadiness,
      contractReady: true,
    });

    const result = await updateReadinessComponent(principal("sdk-admin"), "provider-1", {
      component: "contractReady",
      ready: true,
    });
    expect(result.contractReady).toBe(true);
    expect(mocks.prisma.auditEvent.create).toHaveBeenCalled();
  });

  it("updates payoutReady", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });
    mocks.providerCommercialReadiness.findFirst.mockResolvedValue(baseReadiness);
    mocks.providerCommercialReadiness.update.mockResolvedValue({
      ...baseReadiness,
      payoutReady: true,
    });

    const result = await updateReadinessComponent(principal("sdk-admin"), "provider-1", {
      component: "payoutReady",
      ready: true,
    });
    expect(result.payoutReady).toBe(true);
  });

  it("creates readiness if missing", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });
    mocks.providerCommercialReadiness.findFirst.mockResolvedValue(null);
    mocks.providerCommercialReadiness.create.mockResolvedValue(baseReadiness);
    mocks.providerCommercialReadiness.update.mockResolvedValue({
      ...baseReadiness,
      contractReady: true,
    });

    await updateReadinessComponent(principal("sdk-admin"), "provider-1", {
      component: "contractReady",
      ready: true,
    });
    expect(mocks.providerCommercialReadiness.create).toHaveBeenCalled();
  });

  it("throws for non-admin staff", async () => {
    await expect(
      updateReadinessComponent(principal("delivery"), "provider-1", {
        component: "contractReady",
        ready: true,
      })
    ).rejects.toThrow();
  });

  it("throws for provider", async () => {
    await expect(
      updateReadinessComponent(principal("provider"), "provider-1", {
        component: "contractReady",
        ready: true,
      })
    ).rejects.toThrow();
  });
});
