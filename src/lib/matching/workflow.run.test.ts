import { beforeEach, describe, expect, it, vi } from "vitest";

import { executeMatchRun } from "@/lib/matching/workflow.run";
import { principal } from "@/lib/users/test-fixtures";

const mocks = vi.hoisted(() => {
  const make = () => ({
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  });
  const opportunity = make();
  const provider = make();
  const matchRun = make();
  const matchCandidate = make();
  const matchWeightConfig = make();
  const matchOverride = make();
  const company = make();
  const auditEvent = make();
  return {
    prisma: {
      opportunity,
      provider,
      matchRun,
      matchCandidate,
      matchWeightConfig,
      matchOverride,
      company,
      auditEvent,
      $transaction: vi.fn(),
    },
    opportunity,
    provider,
    matchRun,
    matchCandidate,
    matchWeightConfig,
    matchOverride,
    company,
    auditEvent,
  };
});

vi.mock("@/lib/db", () => ({ getPrisma: () => mocks.prisma }));

mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.prisma));

beforeEach(() => {
  for (const mock of [
    mocks.opportunity,
    mocks.provider,
    mocks.matchRun,
    mocks.matchCandidate,
    mocks.matchWeightConfig,
    mocks.matchOverride,
    mocks.company,
    mocks.auditEvent,
  ]) {
    mock.create?.mockReset();
    mock.findFirst?.mockReset();
    mock.findMany?.mockReset();
    mock.update?.mockReset();
    mock.updateMany?.mockReset();
  }
});

describe("executeMatchRun", () => {
  it("creates match run and transitions opportunity to MATCHING", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue({
      id: "opp-1",
      companyId: "company-1",
      status: "READY",
      budgetMin: 100,
      budgetMax: 200,
      startDate: new Date("2026-09-01"),
      deadline: new Date("2026-09-30"),
      locationTimezone: "Europe/London",
      languages: ["en"],
      requiredSkills: ["web"],
      preferredSkills: [],
    });
    mocks.opportunity.update.mockResolvedValue({ id: "opp-1", status: "MATCHING" });
    mocks.matchRun.create.mockResolvedValue({ id: "run-1", status: "PENDING" });
    mocks.matchRun.update.mockResolvedValue({ id: "run-1", status: "RUNNING" });
    mocks.provider.findMany.mockResolvedValue([]);
    mocks.matchWeightConfig.findFirst.mockResolvedValue(null);
    mocks.matchOverride.findMany.mockResolvedValue([]);

    const result = await executeMatchRun(principal("sdk-admin"), "company-1", "opp-1");

    expect(result.matchRunId).toBe("run-1");
    expect(mocks.opportunity.update).toHaveBeenCalledWith({
      where: { id: "opp-1" },
      data: { status: "MATCHING" },
    });
    expect(mocks.matchRun.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ opportunityId: "opp-1" }),
    });
  });

  it("throws when opportunity is not found", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue(null);

    await expect(executeMatchRun(principal("sdk-admin"), "company-1", "opp-1")).rejects.toThrow(
      "Opportunity not found"
    );
  });

  it("scores eligible providers and persists candidates", async () => {
    mocks.company.findFirst.mockResolvedValue({ id: "company-1" });
    mocks.opportunity.findFirst.mockResolvedValue({
      id: "opp-1",
      companyId: "company-1",
      status: "READY",
      budgetMin: 100,
      budgetMax: 200,
      startDate: new Date("2026-09-01"),
      deadline: new Date("2026-09-30"),
      locationTimezone: "Europe/London",
      languages: ["en"],
      requiredSkills: ["web"],
      preferredSkills: [],
    });
    mocks.opportunity.update.mockResolvedValue({ id: "opp-1", status: "MATCHING" });
    mocks.matchRun.create.mockResolvedValue({ id: "run-1", status: "PENDING" });
    mocks.matchRun.update.mockResolvedValue({ id: "run-1", status: "RUNNING" });
    mocks.provider.findMany.mockResolvedValue([
      {
        id: "provider-1",
        companyId: "company-1",
        status: "ACTIVE",
        commercialStatus: "READY",
        timeZone: "Europe/London",
        languages: ["en"],
        preferredProjectTypes: ["web"],
        yearsOfExperience: 5,
        expectedRateMin: 100,
        expectedRateMax: 200,
        defaultDailyHours: 8,
        weeklyCapacity: [
          {
            id: "c1",
            providerId: "provider-1",
            weekday: 1,
            hoursPerDay: 8,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        absences: [],
        services: [],
      },
    ]);
    mocks.matchWeightConfig.findFirst.mockResolvedValue(null);
    mocks.matchOverride.findMany.mockResolvedValue([]);

    const result = await executeMatchRun(principal("sdk-admin"), "company-1", "opp-1");

    expect(result.totalCandidates).toBe(1);
    expect(result.eligibleCandidates).toBe(1);
    expect(mocks.matchCandidate.create).toHaveBeenCalledTimes(1);
  });
});
