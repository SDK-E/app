import { describe, expect, it, vi } from "vitest";

import { applyMatchOverride } from "@sdk-e/matching/workflow.overrides";
import { principal } from "@sdk-e/test-support/test-fixtures";

const mocks = vi.hoisted(() => {
  const make = () => ({
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  });
  const matchOverride = make();
  const company = make();
  const auditEvent = make();
  return {
    prisma: {
      matchOverride,
      company,
      auditEvent,
      $transaction: vi.fn(),
    },
    matchOverride,
    company,
    auditEvent,
  };
});

vi.mock("@sdk-e/db", () => ({ getPrisma: () => mocks.prisma }));

mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

describe("applyMatchOverride", () => {
  it("creates override and logs audit event", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.matchOverride.create.mockResolvedValue({
      id: "override-1",
      companyId: "company-1",
      opportunityId: "opp-1",
      providerId: "provider-1",
      type: "BOOST",
      reason: "Strategic",
      active: true,
      actorId: "user-1",
      createdAt: new Date(),
    });

    const result = await applyMatchOverride(principal("sdk-admin"), "company-1", {
      companyId: "company-1",
      opportunityId: "opp-1",
      providerId: "provider-1",
      type: "BOOST",
      reason: "Strategic",
      actorId: "user-1",
    });

    expect(result.id).toBe("override-1");
    expect(mocks.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "match.override.boost" }),
    });
  });

  it("deactivates previous overrides before creating new one", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.matchOverride.create.mockResolvedValue({
      id: "override-1",
      companyId: "company-1",
      opportunityId: "opp-1",
      providerId: "provider-1",
      type: "SUPPRESS",
      reason: "Rates",
      active: true,
      actorId: "user-1",
      createdAt: new Date(),
    });

    await applyMatchOverride(principal("sdk-admin"), "company-1", {
      companyId: "company-1",
      opportunityId: "opp-1",
      providerId: "provider-1",
      type: "SUPPRESS",
      reason: "Rates",
      actorId: "user-1",
    });

    expect(mocks.matchOverride.updateMany).toHaveBeenCalledWith({
      where: {
        companyId: "company-1",
        opportunityId: "opp-1",
        providerId: "provider-1",
        active: true,
      },
      data: { active: false },
    });
  });
});
