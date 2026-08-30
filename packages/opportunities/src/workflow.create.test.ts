import { beforeEach, describe, expect, it, vi } from "vitest";

import { createOpportunity } from "@sdk-e/opportunities/workflow/create";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const make = () => ({ create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), delete: vi.fn() });
  const opportunity = make();
  const opportunityPosition = make();
  const opportunityActivity = make();
  const document = make();
  const company = make();
  const auditEvent = make();
  return {
    prisma: {
      opportunity,
      opportunityPosition,
      opportunityActivity,
      document,
      company,
      auditEvent,
      $transaction: vi.fn(),
    },
    opportunity,
    opportunityPosition,
    opportunityActivity,
    document,
    company,
    auditEvent,
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));

mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

beforeEach(() => {
  for (const mock of [
    mocks.opportunity,
    mocks.opportunityPosition,
    mocks.opportunityActivity,
    mocks.document,
    mocks.company,
    mocks.auditEvent,
  ]) {
    mock.create?.mockReset();
    mock.findFirst?.mockReset();
    mock.update?.mockReset();
    mock.delete?.mockReset();
  }
});

describe("createOpportunity", () => {
  it("creates a draft with correct defaults and logs activity + audit", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.create.mockResolvedValue({ id: "opp-1", status: "DRAFT" });
    mocks.opportunityActivity.create.mockResolvedValue({ id: "act-1" });
    mocks.auditEvent.create.mockResolvedValue({ id: "audit-1" });

    await createOpportunity(principal("sdk-admin"), "company-1", {
      title: "Build platform",
      description: "Build a platform",
    });

    expect(mocks.opportunity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        companyId: "company-1",
        status: "DRAFT",
        createdBy: "user-1",
        title: "Build platform",
        description: "Build a platform",
        visibilityMode: "INVITE_ONLY",
        ndaRequired: false,
        clientIdentityVisible: false,
        requiredSkills: [],
        preferredSkills: [],
        currency: "USD",
        providerCount: 1,
      }),
    });
    expect(mocks.opportunityActivity.create).toHaveBeenCalledWith({
      data: { opportunityId: "opp-1", companyId: "company-1", actorId: "user-1", type: "CREATED" },
    });
    expect(mocks.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "opportunity.created", targetType: "Opportunity" }),
      })
    );
  });

  it("rejects non-SDK staff", async () => {
    await expect(
      createOpportunity(principal("provider"), "company-1", { title: "x", description: "y" })
    ).rejects.toThrow("SDK staff access is required.");
    expect(mocks.opportunity.create).not.toHaveBeenCalled();
  });

  it("rejects an inactive company", async () => {
    mocks.company.findFirst.mockResolvedValue(null);
    await expect(
      createOpportunity(principal("sdk-admin"), "company-1", { title: "x", description: "y" })
    ).rejects.toThrow("Company not found.");
    expect(mocks.opportunity.create).not.toHaveBeenCalled();
  });
});
