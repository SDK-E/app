import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createProviderProfile,
  getProviderApplication,
  getProviderApplicationsForReview,
  saveProviderApplicationDraft,
  submitProviderApplication,
} from "@/lib/providers/workflow";
import { principal } from "@/lib/users/test-fixtures";

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

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));
mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

const baseProvider = {
  id: "provider-1",
  userId: "user-1",
  status: "DRAFT" as const,
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

describe("createProviderProfile", () => {
  it("creates a provider with DRAFT status", async () => {
    mocks.provider.findFirst.mockResolvedValue(null);
    mocks.provider.create.mockResolvedValue({ id: "provider-1", status: "DRAFT" });
    const result = await createProviderProfile(principal("provider"));
    expect(mocks.provider.create).toHaveBeenCalledWith({
      data: { userId: "user-1", status: "DRAFT", companyId: null },
    });
    expect(result.id).toBe("provider-1");
  });

  it("returns existing provider if one already exists", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1" });
    mocks.provider.findFirstOrThrow.mockResolvedValue({ id: "provider-1" });
    const result = await createProviderProfile(principal("provider"));
    expect(mocks.provider.create).not.toHaveBeenCalled();
    expect(result.id).toBe("provider-1");
  });
});

describe("saveProviderApplicationDraft", () => {
  it("saves partial data without completeness check", async () => {
    mocks.provider.findFirst.mockResolvedValue(baseProvider);
    mocks.provider.update.mockResolvedValue({ ...baseProvider, professionalTitle: "Engineer" });
    mocks.provider.findFirstOrThrow.mockResolvedValue({
      ...baseProvider,
      professionalTitle: "Engineer",
    });

    const result = await saveProviderApplicationDraft(principal("provider"), {
      professionalTitle: "Engineer",
    });
    expect(mocks.provider.update).toHaveBeenCalled();
    expect(result.professionalTitle).toBe("Engineer");
  });

  it("throws when the provider does not exist", async () => {
    mocks.provider.findFirst.mockResolvedValue(null);
    await expect(
      saveProviderApplicationDraft(principal("provider"), { professionalTitle: "Engineer" })
    ).rejects.toThrow("Provider profile not found.");
  });

  it("throws when the application is already submitted", async () => {
    mocks.provider.findFirst.mockResolvedValue({ ...baseProvider, status: "SUBMITTED" });
    await expect(
      saveProviderApplicationDraft(principal("provider"), { professionalTitle: "Engineer" })
    ).rejects.toThrow("Only draft applications can be edited.");
  });
});

describe("submitProviderApplication", () => {
  it("submits when completeness is sufficient", async () => {
    const completeProvider = {
      ...baseProvider,
      professionalTitle: "Engineer",
      biography: "A".repeat(50),
      yearsOfExperience: 5,
      expectedRateMin: 100,
      expectedRateMax: 200,
      businessLegalInfo: "Legal info",
    };
    mocks.provider.findFirst.mockResolvedValue(completeProvider);
    mocks.provider.update.mockResolvedValue({ ...completeProvider, status: "SUBMITTED" });

    const result = await submitProviderApplication(principal("provider"));
    expect(result.status).toBe("SUBMITTED");
    expect(mocks.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "provider.application.submitted",
          fromState: "DRAFT",
          toState: "SUBMITTED",
        }),
      })
    );
  });

  it("blocks submission when completeness is below 60", async () => {
    const incompleteProvider = { ...baseProvider, professionalTitle: "Engineer" };
    mocks.provider.findFirst.mockResolvedValue(incompleteProvider);
    await expect(submitProviderApplication(principal("provider"))).rejects.toThrow(
      /Application is incomplete/
    );
  });

  it("blocks submission when not in DRAFT status", async () => {
    mocks.provider.findFirst.mockResolvedValue({ ...baseProvider, status: "SUBMITTED" });
    await expect(submitProviderApplication(principal("provider"))).rejects.toThrow(
      "Invalid state transition from SUBMITTED to SUBMITTED"
    );
  });
});

describe("getProviderApplication", () => {
  it("returns the provider's own application", async () => {
    mocks.provider.findFirst.mockResolvedValue(baseProvider);
    const result = await getProviderApplication(principal("provider"));
    expect(result).toEqual(baseProvider);
  });

  it("returns null when no application exists", async () => {
    mocks.provider.findFirst.mockResolvedValue(null);
    const result = await getProviderApplication(principal("provider"));
    expect(result).toBeNull();
  });
});

describe("getProviderApplicationsForReview", () => {
  it("returns applications for review", async () => {
    mocks.provider.findMany.mockResolvedValue([baseProvider]);
    const result = await getProviderApplicationsForReview(principal("sdk-admin"));
    expect(mocks.provider.findMany).toHaveBeenCalledWith({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
      orderBy: { createdAt: "asc" },
    });
    expect(result).toHaveLength(1);
  });
});
