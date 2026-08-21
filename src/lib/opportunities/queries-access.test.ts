import { beforeEach, describe, expect, it, vi } from "vitest";

import { getOpportunity, getOpportunityAttachments } from "@/lib/opportunities/queries";
import { principal } from "@/lib/users/test-fixtures";
import type { Opportunity } from "@/generated/prisma/client";

function makeOpportunity(overrides: Partial<Opportunity>): Opportunity {
  return {
    id: "opp-1",
    companyId: "company-1",
    requestId: null,
    title: "Opportunity",
    description: "Description",
    clientName: null,
    ndaRequired: false,
    clientIdentityVisible: false,
    requiredSkills: [],
    preferredSkills: [],
    seniority: null,
    engagementType: null,
    budgetMin: null,
    budgetMax: null,
    currency: "USD",
    duration: null,
    startDate: null,
    deadline: null,
    locationTimezone: null,
    languages: [],
    deliverables: null,
    providerCount: 1,
    internalNotes: "hidden",
    rejectionFeedback: null,
    ownerId: null,
    status: "DRAFT",
    visibilityMode: "ELIGIBLE_NETWORK",
    createdBy: "user-1",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
    ...overrides,
  } as Opportunity;
}

const mocks = vi.hoisted(() => {
  const make = () => ({ findMany: vi.fn(), findFirst: vi.fn() });
  const opportunity = make();
  const opportunityPosition = make();
  const document = make();
  const company = make();
  return {
    prisma: { opportunity, opportunityPosition, document, company },
    opportunity,
    opportunityPosition,
    document,
    company,
  };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));

beforeEach(() => {
  for (const mock of [
    mocks.opportunity,
    mocks.opportunityPosition,
    mocks.document,
    mocks.company,
  ]) {
    mock.findMany?.mockReset();
    mock.findFirst?.mockReset();
  }
});

describe("getOpportunity", () => {
  it("returns the opportunity for SDK staff including internal notes", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue(
      makeOpportunity({ id: "opp-1", visibilityMode: "DIRECT" })
    );

    const result = await getOpportunity(principal("sdk-admin"), "company-1", "opp-1");

    expect(result.id).toBe("opp-1");
    expect((result as Opportunity).internalNotes).toBe("hidden");
  });

  it("throws for non-SDK callers (unauthorized visibility)", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    await expect(getOpportunity(principal("provider"), "company-1", "opp-1")).rejects.toThrow(
      "SDK staff access is required."
    );
  });

  it("throws when the opportunity does not exist", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue(null);
    await expect(getOpportunity(principal("sdk-admin"), "company-1", "opp-1")).rejects.toThrow(
      "Opportunity not found."
    );
  });
});

describe("getOpportunityAttachments", () => {
  it("filters documents by the opportunity and its positions", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue(makeOpportunity({ id: "opp-1" }));
    mocks.opportunityPosition.findMany.mockResolvedValue([{ id: "pos-1" }]);
    mocks.document.findMany.mockResolvedValue([
      { id: "doc-1", opportunityId: "opp-1" },
      { id: "doc-2", opportunityPositionId: "pos-1" },
    ]);

    const result = await getOpportunityAttachments(principal("sdk-admin"), "company-1", "opp-1");

    expect(mocks.document.findMany).toHaveBeenCalledWith({
      where: {
        companyId: "company-1",
        OR: [{ opportunityId: "opp-1" }, { opportunityPositionId: { in: ["pos-1"] } }],
      },
    });
    expect(result).toHaveLength(2);
  });

  it("excludes documents from other opportunities", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue(makeOpportunity({ id: "opp-1" }));
    mocks.opportunityPosition.findMany.mockResolvedValue([]);
    mocks.document.findMany.mockImplementation(async ({ where }) => {
      if (where.OR[0].opportunityId === "opp-1") return [{ id: "doc-1", opportunityId: "opp-1" }];
      return [];
    });

    const result = await getOpportunityAttachments(principal("sdk-admin"), "company-1", "opp-1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("doc-1");
  });
});
