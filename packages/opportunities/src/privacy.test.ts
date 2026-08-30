import type { Opportunity } from "@platform/db/client";

import { listOpportunities } from "@platform/opportunities/queries";
import { selectOpportunitySafe } from "@platform/opportunities/safe";
import { principal } from "@platform/test-support/test-fixtures";
import { beforeEach, describe, expect, it, vi } from "vitest";

const ELIGIBLE_OPP = {
  id: "opp-eligible",
  companyId: "company-1",
  visibilityMode: "ELIGIBLE_NETWORK",
  internalNotes: "secret",
} as unknown as Opportunity;

const DIRECT_OPP = {
  id: "opp-direct",
  companyId: "company-1",
  visibilityMode: "DIRECT",
  internalNotes: "secret",
} as unknown as Opportunity;

const INVITE_ONLY_OPP = {
  id: "opp-invite",
  companyId: "company-1",
  visibilityMode: "INVITE_ONLY",
  internalNotes: "secret",
} as unknown as Opportunity;

const mocks = vi.hoisted(() => {
  const make = () => ({ findMany: vi.fn(), findFirst: vi.fn() });
  const opportunity = make();
  const provider = make();
  const opportunityInvitation = make();
  const opportunityProviderPreference = make();
  return {
    prisma: { opportunity, provider, opportunityInvitation, opportunityProviderPreference },
    opportunity,
    provider,
    opportunityInvitation,
    opportunityProviderPreference,
  };
});

vi.mock("@platform/db", () => ({ getPrisma: () => mocks.prisma }));
vi.mock("@platform/opportunities/eligibility-browse", () => ({
  isProviderEligibleForOpportunity: vi.fn(async () => ({ eligible: true })),
}));

beforeEach(() => {
  for (const mock of [
    mocks.opportunity,
    mocks.provider,
    mocks.opportunityInvitation,
    mocks.opportunityProviderPreference,
  ]) {
    mock.findMany?.mockReset();
    mock.findFirst?.mockReset();
  }
});

describe("opportunity privacy", () => {
  it("provider browse excludes DIRECT and INVITE_ONLY without an active invitation", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1", companyId: "company-1" });
    mocks.opportunity.findMany.mockResolvedValue([ELIGIBLE_OPP, DIRECT_OPP, INVITE_ONLY_OPP]);
    mocks.opportunityInvitation.findMany.mockResolvedValue([]);
    mocks.opportunityProviderPreference.findMany.mockResolvedValue([]);

    const result = await listOpportunities(principal("provider"), "company-1");

    expect(result.map((o) => o.id)).toEqual(["opp-eligible"]);
  });

  it("provider browse surfaces DIRECT/INVITE_ONLY when an active invitation exists", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1", companyId: "company-1" });
    mocks.opportunity.findMany.mockResolvedValue([ELIGIBLE_OPP, DIRECT_OPP]);
    mocks.opportunityInvitation.findMany.mockResolvedValue([
      {
        opportunityId: "opp-direct",
        status: "PENDING",
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    ]);
    mocks.opportunityProviderPreference.findMany.mockResolvedValue([]);

    const result = await listOpportunities(principal("provider"), "company-1");

    expect(result.map((o) => o.id).sort()).toEqual(["opp-direct", "opp-eligible"]);
  });

  it("provider browse hides opportunities the provider has hidden", async () => {
    mocks.provider.findFirst.mockResolvedValue({ id: "provider-1", companyId: "company-1" });
    mocks.opportunity.findMany.mockResolvedValue([ELIGIBLE_OPP]);
    mocks.opportunityInvitation.findMany.mockResolvedValue([]);
    mocks.opportunityProviderPreference.findMany.mockResolvedValue([
      { opportunityId: "opp-eligible", action: "HIDDEN" },
    ]);

    const result = await listOpportunities(principal("provider"), "company-1");

    expect(result).toHaveLength(0);
  });

  it("client cannot see internal notes", async () => {
    mocks.opportunity.findMany.mockResolvedValue([ELIGIBLE_OPP]);

    const result = await listOpportunities(principal("owner"), "company-1");

    expect(result[0]).not.toHaveProperty("internalNotes");
  });

  it("SDK FINANCE cannot see internal notes", async () => {
    const finance = {
      ...principal("sdk-admin"),
      kind: "sdk-staff" as const,
      role: "FINANCE" as const,
    };
    const result = selectOpportunitySafe(finance, ELIGIBLE_OPP);
    expect(result).not.toHaveProperty("internalNotes");
  });
});
