import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitServiceForReview } from "@sdk-e/providers/services/draft";
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

describe("submitServiceForReview", () => {
  it("submits when completeness is sufficient", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      provider: { userId: "user-1" },
    });
    mocks.providerService.update.mockResolvedValue({ ...baseService, status: "SUBMITTED" });

    const result = await submitServiceForReview(principal("provider"), "svc-1");
    expect(result.status).toBe("SUBMITTED");
    expect(mocks.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "provider.service.submitted",
          fromState: "DRAFT",
          toState: "SUBMITTED",
        }),
      })
    );
  });

  it("blocks submission when not in DRAFT status", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      status: "SUBMITTED",
      provider: { userId: "user-1" },
    });
    await expect(submitServiceForReview(principal("provider"), "svc-1")).rejects.toThrow(
      "Invalid state transition from SUBMITTED to SUBMITTED"
    );
  });

  it("blocks submission when completeness is below 60", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      title: "",
      description: "",
      capability: "other",
      pricingModel: null,
      completenessScore: 0,
      provider: { userId: "user-1" },
    });
    await expect(submitServiceForReview(principal("provider"), "svc-1")).rejects.toThrow(
      /Service is incomplete/
    );
  });
});
