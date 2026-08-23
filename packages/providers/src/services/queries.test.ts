import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getService,
  getProviderServices,
  getServicesForReview,
} from "@sdk-e/providers/services/queries";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const providerService = {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  };
  const provider = { findFirst: vi.fn() };
  return {
    prisma: {
      providerService,
      provider,
    },
    providerService,
    provider,
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));

const baseService = {
  id: "svc-1",
  providerId: "provider-1",
  status: "DRAFT" as const,
  title: "Cloud Migration Service",
  description: "A".repeat(50),
  capability: "modernization",
  categoryTags: [],
  pricingModel: "HOURLY" as const,
  rateMin: null,
  rateMax: null,
  currency: "USD",
  estimatedDuration: null,
  deliverables: null,
  completenessScore: 60,
  publishedAt: null,
  unpublishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  for (const mock of [
    mocks.providerService.findFirst,
    mocks.providerService.findMany,
    mocks.provider.findFirst,
  ]) {
    mock.mockReset();
  }
});

describe("getService", () => {
  it("returns service for owning provider", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });

    const result = await getService(principal("provider"), "svc-1");
    expect(result?.id).toBe("svc-1");
  });

  it("returns null for non-owning provider", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-other" });

    const result = await getService(principal("provider"), "svc-1");
    expect(result).toBeNull();
  });

  it("returns service for SDK staff", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    const result = await getService(principal("sdk-admin"), "svc-1");
    expect(result?.id).toBe("svc-1");
  });

  it("returns null for non-existent service", async () => {
    mocks.providerService.findFirst.mockResolvedValue(null);
    const result = await getService(principal("sdk-admin"), "svc-1");
    expect(result).toBeNull();
  });
});

describe("getProviderServices", () => {
  it("returns services for the current provider", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });
    mocks.providerService.findMany.mockResolvedValue([baseService]);

    const result = await getProviderServices(principal("provider"));
    expect(mocks.providerService.findMany).toHaveBeenCalledWith({
      where: { providerId: "provider-1" },
      orderBy: { createdAt: "desc" },
    });
    expect(result).toHaveLength(1);
  });

  it("returns empty array when provider not found", async () => {
    mocks.provider.findFirst.mockResolvedValue(null);
    const result = await getProviderServices(principal("provider"));
    expect(result).toHaveLength(0);
  });
});

describe("getServicesForReview", () => {
  it("returns submitted and under review services for SDK staff", async () => {
    mocks.providerService.findMany.mockResolvedValue([baseService]);
    const result = await getServicesForReview(principal("sdk-admin"));
    expect(mocks.providerService.findMany).toHaveBeenCalledWith({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      orderBy: { createdAt: "asc" },
    });
    expect(result).toHaveLength(1);
  });

  it("blocks provider from accessing review queue", async () => {
    await expect(getServicesForReview(principal("provider"))).rejects.toThrow(
      "SDK staff access is required."
    );
  });
});
