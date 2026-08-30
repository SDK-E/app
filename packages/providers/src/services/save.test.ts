import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveServiceDraft } from "@sdk-e/providers/services/draft";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const providerService = {
    findFirst: vi.fn(),
    update: vi.fn(),
    findFirstOrThrow: vi.fn(),
  };
  return {
    prisma: {
      providerService,
      $transaction: vi.fn(),
    },
    providerService,
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));
mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

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
    mocks.providerService.update,
    mocks.providerService.findFirstOrThrow,
  ]) {
    mock.mockReset();
  }
});

describe("saveServiceDraft", () => {
  it("saves partial data on a draft service", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      provider: { userId: "user-1" },
    });
    mocks.providerService.update.mockResolvedValue(baseService);
    mocks.providerService.findFirstOrThrow.mockResolvedValue(baseService);

    const result = await saveServiceDraft(principal("provider"), "svc-1", {
      title: "Updated Title",
    });
    expect(mocks.providerService.update).toHaveBeenCalled();
    expect(result.id).toBe("svc-1");
  });

  it("throws when service not found", async () => {
    mocks.providerService.findFirst.mockResolvedValue(null);
    await expect(
      saveServiceDraft(principal("provider"), "svc-1", { title: "Test" })
    ).rejects.toThrow("Service not found.");
  });

  it("throws when service belongs to another provider", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      provider: { userId: "user-other" },
    });
    await expect(
      saveServiceDraft(principal("provider"), "svc-1", { title: "Test" })
    ).rejects.toThrow("Service not found.");
  });

  it("throws when service is submitted", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      status: "SUBMITTED",
      provider: { userId: "user-1" },
    });
    await expect(
      saveServiceDraft(principal("provider"), "svc-1", { title: "Test" })
    ).rejects.toThrow("Only draft or rejected services can be edited.");
  });

  it("allows editing rejected services", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      status: "REJECTED",
      provider: { userId: "user-1" },
    });
    mocks.providerService.update.mockResolvedValue(baseService);
    mocks.providerService.findFirstOrThrow.mockResolvedValue(baseService);

    const result = await saveServiceDraft(principal("provider"), "svc-1", {
      title: "Revised",
    });
    expect(result.id).toBe("svc-1");
  });
});
