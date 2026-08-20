import { beforeEach, describe, expect, it, vi } from "vitest";

import { convertRequestToOpportunity } from "@/lib/requests/opportunities";
import { common } from "@/lib/users/test-fixtures";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const request = { findFirst: vi.fn() };
  const opportunity = { create: vi.fn() };
  const requestActivity = { create: vi.fn() };
  const company = { findFirst: vi.fn() };
  return {
    prisma: { request, opportunity, requestActivity, company, $transaction: vi.fn() },
    request,
    opportunity,
    requestActivity,
    company,
  };
});

vi.mock("@/lib/db", () => ({
  getPrisma: () => mocks.prisma,
}));

mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

beforeEach(() => {
  mocks.request.findFirst.mockReset();
  mocks.opportunity.create.mockReset();
  mocks.requestActivity.create.mockReset();
  mocks.company.findFirst.mockReset();
});

describe("convertRequestToOpportunity", () => {
  it("converts an approved request into an opportunity and logs it", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue({
      id: "request-1",
      status: "APPROVED",
      title: "Modernize",
      description: "Modernize stack",
      businessContext: "Growth phase",
      desiredOutcomes: "Scalable architecture",
      opportunity: null,
    });
    mocks.opportunity.create.mockResolvedValue({
      id: "opportunity-1",
      title: "Modernize",
      status: "DRAFT",
      visibilityMode: "INVITE_ONLY",
    });
    mocks.requestActivity.create.mockResolvedValue({ id: "activity-1" });

    const result = await convertRequestToOpportunity(
      principal("sdk-admin"),
      "company-1",
      "request-1"
    );

    expect(mocks.opportunity.create).toHaveBeenCalledWith({
      data: {
        companyId: "company-1",
        requestId: "request-1",
        title: "Modernize",
        description: "Modernize stack\n\nGrowth phase\n\nScalable architecture",
        visibilityMode: "INVITE_ONLY",
        status: "DRAFT",
        createdBy: "user-1",
        requiredSkills: [],
        preferredSkills: [],
        seniority: null,
        engagementType: null,
        startDate: null,
        duration: null,
        locationTimezone: null,
        languages: [],
      },
    });
    expect(mocks.requestActivity.create).toHaveBeenCalledWith({
      data: {
        requestId: "request-1",
        companyId: "company-1",
        actorId: "user-1",
        type: "CONVERTED_TO_OPPORTUNITY",
      },
    });
    expect(result).toEqual({
      id: "opportunity-1",
      title: "Modernize",
      status: "DRAFT",
      visibilityMode: "INVITE_ONLY",
    });
  });

  it("rejects a request that has not been approved", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue({
      id: "request-1",
      status: "IN_REVIEW",
      opportunity: null,
    });

    await expect(
      convertRequestToOpportunity(principal("sdk-admin"), "company-1", "request-1")
    ).rejects.toThrow("Only approved requests can become opportunities.");
    expect(mocks.opportunity.create).not.toHaveBeenCalled();
  });

  it("rejects a request already linked to an opportunity", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue({
      id: "request-1",
      status: "APPROVED",
      opportunity: { id: "opportunity-1" },
    });

    await expect(
      convertRequestToOpportunity(principal("sdk-admin"), "company-1", "request-1")
    ).rejects.toThrow("This request is already linked to an opportunity.");
    expect(mocks.opportunity.create).not.toHaveBeenCalled();
  });

  it("throws when the request does not exist", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue(null);

    await expect(
      convertRequestToOpportunity(principal("sdk-admin"), "company-1", "request-missing")
    ).rejects.toThrow("Request not found.");
    expect(mocks.opportunity.create).not.toHaveBeenCalled();
  });

  it("rejects when the target company is inactive", async () => {
    mocks.company.findFirst.mockResolvedValue(null);

    await expect(
      convertRequestToOpportunity(principal("sdk-admin"), "company-1", "request-1")
    ).rejects.toThrow("Company not found.");
    expect(mocks.opportunity.create).not.toHaveBeenCalled();
  });

  it("rejects staff roles outside the allowed set", async () => {
    const finance = { ...common, kind: "sdk-staff", role: "FINANCE" } as const;

    await expect(convertRequestToOpportunity(finance, "company-1", "request-1")).rejects.toThrow(
      "SDK staff access is required."
    );
    expect(mocks.opportunity.create).not.toHaveBeenCalled();
  });

  it("composes the description without null fields", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.request.findFirst.mockResolvedValue({
      id: "request-1",
      status: "APPROVED",
      title: "Modernize",
      description: "Modernize stack",
      businessContext: null,
      desiredOutcomes: null,
      opportunity: null,
    });
    mocks.opportunity.create.mockResolvedValue({ id: "opportunity-1" });

    await convertRequestToOpportunity(principal("sdk-admin"), "company-1", "request-1");

    expect(mocks.opportunity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        description: "Modernize stack",
      }),
    });
  });
});
