import { beforeEach, describe, expect, it, vi } from "vitest";

import { listOpportunities } from "@sdk-e/opportunities/queries";
import { principal } from "@sdk-e/test-support/test-fixtures";
import type { Opportunity } from "@sdk-e/db/client";

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
  const provider = make();
  const opportunityInvitation = make();
  const opportunityProviderPreference = make();
  return {
    prisma: {
      opportunity,
      opportunityPosition,
      document,
      company,
      provider,
      opportunityInvitation,
      opportunityProviderPreference,
    },
    opportunity,
    opportunityPosition,
    document,
    company,
    provider,
    opportunityInvitation,
    opportunityProviderPreference,
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));
vi.mock("@sdk-e/opportunities/eligibility-browse", () => ({
  isProviderEligibleForOpportunity: vi.fn(async () => ({ eligible: true })),
}));

beforeEach(() => {
  for (const mock of [
    mocks.opportunity,
    mocks.opportunityPosition,
    mocks.document,
    mocks.company,
    mocks.provider,
    mocks.opportunityInvitation,
    mocks.opportunityProviderPreference,
  ]) {
    mock.findMany?.mockReset();
    mock.findFirst?.mockReset();
  }
});

describe("listOpportunities", () => {
  it("returns all opportunities for SDK staff", async () => {
    mocks.opportunity.findMany.mockResolvedValue([
      makeOpportunity({ id: "opp-eligible", visibilityMode: "ELIGIBLE_NETWORK" }),
      makeOpportunity({ id: "opp-direct", visibilityMode: "DIRECT" }),
    ]);

    const result = await listOpportunities(principal("sdk-admin"), "company-1");

    expect(mocks.opportunity.findMany).toHaveBeenCalledWith({
      where: { companyId: "company-1" },
    });
    expect(result).toHaveLength(2);
    expect((result[1] as Opportunity).internalNotes).toBe("hidden");
  });

  it("filters by visibility mode for clients and providers", async () => {
    mocks.opportunity.findMany.mockResolvedValue([
      makeOpportunity({ id: "opp-eligible", visibilityMode: "ELIGIBLE_NETWORK" }),
    ]);

    const clientResult = await listOpportunities(principal("owner"), "company-1");
    expect(mocks.opportunity.findMany).toHaveBeenCalledWith({
      where: { companyId: "company-1", visibilityMode: "ELIGIBLE_NETWORK" },
    });
    expect(clientResult).toHaveLength(1);
    expect(clientResult[0].id).toBe("opp-eligible");

    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1", companyId: "company-1" });
    mocks.opportunity.findMany.mockResolvedValue([
      makeOpportunity({ id: "opp-eligible", visibilityMode: "ELIGIBLE_NETWORK" }),
    ]);
    mocks.opportunityInvitation.findMany.mockResolvedValue([]);
    mocks.opportunityProviderPreference.findMany.mockResolvedValue([]);

    const providerResult = await listOpportunities(principal("provider"), "company-1");
    expect(providerResult).toHaveLength(1);
    expect(providerResult[0].id).toBe("opp-eligible");
  });

  it("applies status and skills filters for SDK staff", async () => {
    mocks.opportunity.findMany.mockResolvedValue([]);

    await listOpportunities(principal("sdk-admin"), "company-1", {
      status: "OPEN",
      skills: ["typescript"],
    });

    expect(mocks.opportunity.findMany).toHaveBeenCalledWith({
      where: {
        companyId: "company-1",
        status: "OPEN",
        requiredSkills: { hasSome: ["typescript"] },
      },
    });
  });
});
