import { beforeEach, describe, expect, it, vi } from "vitest";

import { listOpportunities } from "@/lib/opportunities/queries";
import { selectOpportunitySafe } from "@/lib/opportunities/safe";
import { principal } from "@/lib/users/test-fixtures";
import type { Opportunity } from "@/generated/prisma/client";

const ELIGIBLE_OPP = {
  id: "opp-eligible",
  companyId: "company-1",
  visibilityMode: "ELIGIBLE_NETWORK",
  internalNotes: "secret",
} as unknown as Opportunity;

const mocks = vi.hoisted(() => {
  const opportunity = { findMany: vi.fn() };
  return { prisma: { opportunity }, opportunity };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));

beforeEach(() => {
  mocks.opportunity.findMany.mockReset();
});

describe("opportunity privacy", () => {
  it("provider cannot list opportunities (only ELIGIBLE_NETWORK browse, none present)", async () => {
    mocks.opportunity.findMany.mockResolvedValue([]);

    const result = await listOpportunities(principal("provider"), "company-1");

    expect(mocks.opportunity.findMany).toHaveBeenCalledWith({
      where: { companyId: "company-1", visibilityMode: "ELIGIBLE_NETWORK" },
    });
    expect(result).toHaveLength(0);
  });

  it("provider browse excludes DIRECT and INVITE_ONLY via query scope", async () => {
    mocks.opportunity.findMany.mockResolvedValue([]);

    await listOpportunities(principal("provider"), "company-1");

    expect(mocks.opportunity.findMany).toHaveBeenCalledWith({
      where: { companyId: "company-1", visibilityMode: "ELIGIBLE_NETWORK" },
    });
  });

  it("provider browse only surfaces ELIGIBLE_NETWORK opportunities", async () => {
    mocks.opportunity.findMany.mockResolvedValue([ELIGIBLE_OPP]);

    const result = await listOpportunities(principal("provider"), "company-1");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("opp-eligible");
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
