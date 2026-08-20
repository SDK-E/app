import { beforeEach, describe, expect, it, vi } from "vitest";
import { reviewProviderService } from "@/lib/providers/services/review";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const providerService = {
    findFirst: vi.fn(),
    update: vi.fn(),
  };
  const providerServiceReview = { create: vi.fn() };
  const auditEvent = { create: vi.fn() };
  return {
    prisma: {
      providerService,
      providerServiceReview,
      auditEvent,
      $transaction: vi.fn(),
    },
    providerService,
    providerServiceReview,
    auditEvent,
  };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));
mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

const baseService = {
  id: "svc-1",
  providerId: "provider-1",
  status: "UNDER_REVIEW" as const,
  provider: { userId: "user-2" },
};

beforeEach(() => {
  for (const mock of [
    mocks.providerService.findFirst,
    mocks.providerService.update,
    mocks.providerServiceReview.create,
    mocks.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("reviewProviderService", () => {
  it("approves and creates review record", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    mocks.providerService.update.mockResolvedValue({ ...baseService, status: "APPROVED" });

    await reviewProviderService(principal("sdk-admin"), "svc-1", { decision: "approve" });

    expect(mocks.providerService.update).toHaveBeenCalledWith({
      where: { id: "svc-1" },
      data: { status: "APPROVED" },
    });
    expect(mocks.providerServiceReview.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: "APPROVED" }) })
    );
    expect(mocks.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "provider.service.approve",
          fromState: "UNDER_REVIEW",
          toState: "APPROVED",
        }),
      })
    );
  });

  it("rejects and stores reason", async () => {
    mocks.providerService.findFirst.mockResolvedValue(baseService);
    mocks.providerService.update.mockResolvedValue({ ...baseService, status: "REJECTED" });

    await reviewProviderService(principal("sdk-admin"), "svc-1", {
      decision: "reject",
      reason: "Needs more detail.",
    });

    expect(mocks.providerService.update).toHaveBeenCalledWith({
      where: { id: "svc-1" },
      data: { status: "REJECTED" },
    });
    expect(mocks.providerServiceReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "REJECTED", reason: "Needs more detail." }),
      })
    );
  });

  it("blocks provider from reviewing own service", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      provider: { userId: "user-1" },
    });
    await expect(
      reviewProviderService(principal("sdk-admin"), "svc-1", { decision: "approve" })
    ).rejects.toThrow("You cannot review your own service.");
  });

  it("blocks invalid transitions", async () => {
    mocks.providerService.findFirst.mockResolvedValue({
      ...baseService,
      status: "PUBLISHED",
    });
    await expect(
      reviewProviderService(principal("sdk-admin"), "svc-1", { decision: "approve" })
    ).rejects.toThrow("Invalid state transition from PUBLISHED to APPROVED");
  });
});
