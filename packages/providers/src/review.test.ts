import { reviewProviderApplication } from "@platform/providers/review";
import { principal } from "@platform/test-support/test-fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const provider = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  };
  const providerReview = { create: vi.fn() };
  const auditEvent = { create: vi.fn() };
  return {
    prisma: {
      provider,
      providerReview,
      auditEvent,
      $transaction: vi.fn(),
    },
    provider,
    providerReview,
    auditEvent,
  };
});

vi.mock("@platform/db", () => ({ getPrisma: () => mocks.prisma }));
mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

const baseProvider = {
  id: "provider-1",
  userId: "user-1",
  status: "UNDER_REVIEW" as const,
  businessName: null,
  timeZone: null,
  professionalTitle: null,
  biography: null,
  cvStorageKey: null,
  portfolioUrl: null,
  yearsOfExperience: null,
  languages: [],
  expectedRateMin: null,
  expectedRateMax: null,
  linkedinUrl: null,
  githubUrl: null,
  websiteUrl: null,
  businessLegalInfo: null,
  vatInfo: null,
  preferredProjectTypes: [],
  completenessScore: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  for (const mock of [
    mocks.provider.create,
    mocks.provider.findFirst,
    mocks.provider.findFirstOrThrow,
    mocks.provider.update,
    mocks.provider.findMany,
    mocks.providerReview.create,
    mocks.auditEvent.create,
  ]) {
    mock.mockReset();
  }
});

describe("reviewProviderApplication", () => {
  it("approves and creates review record", async () => {
    const underReview = { ...baseProvider, status: "UNDER_REVIEW" as const, userId: "user-2" };
    mocks.provider.findFirst.mockResolvedValue(underReview);
    mocks.provider.update.mockResolvedValue({ ...underReview, status: "APPROVED" });

    await reviewProviderApplication(principal("sdk-admin"), "provider-1", {
      decision: "approve",
    });

    expect(mocks.provider.update).toHaveBeenCalledWith({
      where: { id: "provider-1" },
      data: { status: "APPROVED" },
    });
    expect(mocks.providerReview.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: "APPROVED" }) }),
    );
    expect(mocks.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "provider.application.approve",
          fromState: "UNDER_REVIEW",
          toState: "APPROVED",
        }),
      }),
    );
  });

  it("rejects with reason", async () => {
    const underReview = { ...baseProvider, status: "UNDER_REVIEW" as const, userId: "user-2" };
    mocks.provider.findFirst.mockResolvedValue(underReview);
    mocks.provider.update.mockResolvedValue({ ...underReview, status: "REJECTED" });

    await reviewProviderApplication(principal("sdk-admin"), "provider-1", {
      decision: "reject",
      reason: "Missing details",
    });

    expect(mocks.providerReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "REJECTED", reason: "Missing details" }),
      }),
    );
  });

  it("requests changes with reason", async () => {
    const underReview = { ...baseProvider, status: "UNDER_REVIEW" as const, userId: "user-2" };
    mocks.provider.findFirst.mockResolvedValue(underReview);
    mocks.provider.update.mockResolvedValue({ ...underReview, status: "CHANGES_REQUESTED" });

    await reviewProviderApplication(principal("sdk-admin"), "provider-1", {
      decision: "requestChanges",
      reason: "Need more details",
    });

    expect(mocks.providerReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "CHANGES_REQUESTED", reason: "Need more details" }),
      }),
    );
  });

  it("throws on self-approval", async () => {
    mocks.provider.findFirst.mockResolvedValue({ ...baseProvider, userId: "user-1" });
    await expect(
      reviewProviderApplication(principal("sdk-admin"), "provider-1", { decision: "approve" }),
    ).rejects.toThrow("You cannot review your own application.");
  });

  it("throws on invalid transition", async () => {
    mocks.provider.findFirst.mockResolvedValue({
      ...baseProvider,
      status: "DRAFT" as const,
      userId: "user-2",
    });
    await expect(
      reviewProviderApplication(principal("sdk-admin"), "provider-1", { decision: "approve" }),
    ).rejects.toThrow("Invalid state transition from DRAFT to APPROVED");
  });
});
