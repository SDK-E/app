import { beforeEach, describe, expect, it, vi } from "vitest";
import { publishService, unpublishService } from "@sdk-e/providers/services/publishing";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const providerService = {
    findFirst: vi.fn(),
    update: vi.fn(),
  };
  const auditEvent = { create: vi.fn() };
  return {
    prisma: {
      providerService,
      auditEvent,
      $transaction: vi.fn(),
    },
    providerService,
    auditEvent,
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
    mocks.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("publishService", () => {
  it("publishes an approved service", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      status: "APPROVED",
    });
    mocks.providerService.update.mockResolvedValue({
      ...baseService,
      status: "PUBLISHED",
    });

    const result = await publishService(principal("sdk-admin"), "svc-1");
    expect(result.status).toBe("PUBLISHED");
    expect(mocks.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "provider.service.publish",
          fromState: "APPROVED",
          toState: "PUBLISHED",
        }),
      })
    );
  });

  it("blocks publish from DRAFT", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    await expect(publishService(principal("sdk-admin"), "svc-1")).rejects.toThrow(
      "Invalid state transition from DRAFT to PUBLISHED"
    );
  });

  it("blocks provider from publishing", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      status: "APPROVED",
    });
    await expect(publishService(principal("provider"), "svc-1")).rejects.toThrow(
      "SDK staff access is required."
    );
  });
});

describe("unpublishService", () => {
  it("unpublishes a published service", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      status: "PUBLISHED",
    });
    mocks.providerService.update.mockResolvedValue({
      ...baseService,
      status: "UNPUBLISHED",
    });

    const result = await unpublishService(principal("sdk-admin"), "svc-1");
    expect(result.status).toBe("UNPUBLISHED");
  });

  it("blocks unpublish from DRAFT", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    await expect(unpublishService(principal("sdk-admin"), "svc-1")).rejects.toThrow(
      "Invalid state transition from DRAFT to UNPUBLISHED"
    );
  });
});
