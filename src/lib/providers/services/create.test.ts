import { beforeEach, describe, expect, it, vi } from "vitest";
import { createServiceDraft } from "@/lib/providers/services/draft";
import type { ServiceDraftInput } from "@/lib/providers/services/schemas";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const providerService = {
    create: vi.fn(),
    update: vi.fn(),
    findFirstOrThrow: vi.fn(),
  };
  const provider = { findFirst: vi.fn() };
  const auditEvent = { create: vi.fn() };
  return {
    prisma: {
      providerService,
      provider,
      auditEvent,
      $transaction: vi.fn(),
    },
    providerService,
    provider,
    auditEvent,
  };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));
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

const baseProvider = {
  id: "provider-1",
  userId: "user-1",
  status: "APPROVED" as const,
};

beforeEach(() => {
  for (const mock of [
    mocks.providerService.create,
    mocks.providerService.findFirstOrThrow,
    mocks.providerService.update,
    mocks.provider.findFirst,
    mocks.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("createServiceDraft", () => {
  it("creates a service for an approved provider", async () => {
    mocks.provider.findFirst.mockResolvedValue(baseProvider);
    mocks.providerService.create.mockResolvedValue(baseService);
    mocks.providerService.update.mockResolvedValue(baseService);
    mocks.providerService.findFirstOrThrow.mockResolvedValue(baseService);

    const result = await createServiceDraft(principal("provider"), {
      title: "Cloud Migration Service",
      description: "A".repeat(50),
      capability: "modernization",
      pricingModel: "HOURLY",
      categoryTags: [],
      currency: "USD",
      estimatedDuration: null,
      deliverables: null,
      rateMin: null,
      rateMax: null,
    } as ServiceDraftInput);
    expect(mocks.providerService.create).toHaveBeenCalled();
    expect(result.id).toBe("svc-1");
  });

  it("blocks creation for non-approved providers", async () => {
    mocks.provider.findFirst.mockResolvedValue({ ...baseProvider, status: "DRAFT" });
    await expect(
      createServiceDraft(principal("provider"), {
        title: "Test",
        description: "",
        capability: "other",
        pricingModel: null,
        categoryTags: [],
        currency: "USD",
        estimatedDuration: null,
        deliverables: null,
        rateMin: null,
        rateMax: null,
      } as ServiceDraftInput)
    ).rejects.toThrow("Only approved providers can create services.");
  });

  it("throws when provider profile not found", async () => {
    mocks.provider.findFirst.mockResolvedValue(null);
    await expect(
      createServiceDraft(principal("provider"), {
        title: "Test",
        description: "",
        capability: "other",
        pricingModel: null,
        categoryTags: [],
        currency: "USD",
        estimatedDuration: null,
        deliverables: null,
        rateMin: null,
        rateMax: null,
      } as ServiceDraftInput)
    ).rejects.toThrow("Provider profile not found.");
  });
});
