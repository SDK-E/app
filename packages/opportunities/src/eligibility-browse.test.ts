import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  Opportunity,
  Provider,
  ProviderAbsence,
  ProviderWeeklyCapacity,
} from "@sdk-e/db/client";
import { Prisma } from "@sdk-e/db/client";

import { isProviderEligibleForOpportunity } from "@sdk-e/opportunities/eligibility-browse";

const mocks = vi.hoisted(() => {
  const make = () => ({
    findFirst: vi.fn(),
    findMany: vi.fn(),
  });
  const provider = make();
  const opportunity = make();
  const providerWeeklyCapacity = make();
  const providerAbsence = make();
  const prisma = { provider, opportunity, providerWeeklyCapacity, providerAbsence };
  return { prisma, provider, opportunity, providerWeeklyCapacity, providerAbsence };
});

vi.mock("@sdk-e/db", () => ({
  getPrisma: () => mocks.prisma,
}));

const baseProvider = {
  id: "provider-1",
  companyId: "company-1",
  status: "ACTIVE" as const,
  commercialStatus: "READY" as const,
  timeZone: "Europe/London",
  languages: ["en", "fr"],
  preferredProjectTypes: ["web", "mobile"],
  yearsOfExperience: 5,
  expectedRateMin: new Prisma.Decimal(100),
  expectedRateMax: new Prisma.Decimal(200),
  defaultDailyHours: new Prisma.Decimal(8),
} as unknown as Provider;

const baseOpportunity = {
  id: "opp-1",
  companyId: "company-1",
  budgetMin: new Prisma.Decimal(150),
  budgetMax: new Prisma.Decimal(250),
  startDate: new Date("2026-09-01"),
  deadline: new Date("2026-09-30"),
  locationTimezone: "Europe/London",
  languages: ["en"],
  requiredSkills: ["web"],
  preferredSkills: ["mobile"],
} as unknown as Opportunity;

const capacity: ProviderWeeklyCapacity[] = [
  {
    id: "c1",
    providerId: "provider-1",
    weekday: 1,
    hoursPerDay: new Prisma.Decimal(8),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("isProviderEligibleForOpportunity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.provider.findFirst.mockResolvedValue(baseProvider);
    mocks.opportunity.findFirst.mockResolvedValue(baseOpportunity);
    mocks.providerWeeklyCapacity.findMany.mockResolvedValue(capacity);
    mocks.providerAbsence.findMany.mockResolvedValue([]);
  });

  it("is eligible when provider is ACTIVE, READY, budget overlaps, and has available hours", async () => {
    const result = await isProviderEligibleForOpportunity("provider-1", "opp-1");
    expect(result.eligible).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("is not eligible when provider status is SUSPENDED", async () => {
    mocks.provider.findFirst.mockResolvedValue({ ...baseProvider, status: "SUSPENDED" });
    const result = await isProviderEligibleForOpportunity("provider-1", "opp-1");
    expect(result.eligible).toBe(false);
  });

  it("is not eligible when budget ranges do not overlap", async () => {
    mocks.provider.findFirst.mockResolvedValue({
      ...baseProvider,
      expectedRateMin: new Prisma.Decimal(300),
      expectedRateMax: new Prisma.Decimal(400),
    });
    const result = await isProviderEligibleForOpportunity("provider-1", "opp-1");
    expect(result.eligible).toBe(false);
  });

  it("is not eligible when the provider has no weekly capacity", async () => {
    mocks.providerWeeklyCapacity.findMany.mockResolvedValue([]);
    const result = await isProviderEligibleForOpportunity("provider-1", "opp-1");
    expect(result.eligible).toBe(false);
    expect(result.warnings.some((w) => w.includes("no weekly capacity"))).toBe(true);
  });

  it("is not eligible when an approved absence covers the entire window", async () => {
    const absences: ProviderAbsence[] = [
      {
        id: "a1",
        providerId: "provider-1",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-09-30"),
        reason: null,
        status: "APPROVED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mocks.providerAbsence.findMany.mockResolvedValue(absences);
    const result = await isProviderEligibleForOpportunity("provider-1", "opp-1");
    expect(result.eligible).toBe(false);
  });

  it("produces warnings when provider or opportunity data is missing", async () => {
    mocks.provider.findFirst.mockResolvedValue(null);
    const result = await isProviderEligibleForOpportunity("provider-1", "opp-1");
    expect(result.eligible).toBe(false);
    expect(result.warnings.some((w) => w.includes("Missing provider or opportunity"))).toBe(true);
  });

  it("produces warnings when the opportunity has no dates", async () => {
    mocks.opportunity.findFirst.mockResolvedValue({
      ...baseOpportunity,
      startDate: null,
      deadline: null,
    });
    const result = await isProviderEligibleForOpportunity("provider-1", "opp-1");
    expect(result.eligible).toBe(true);
    expect(result.warnings.some((w) => w.includes("no start date"))).toBe(true);
  });

  it("is not eligible when provider and opportunity belong to different companies", async () => {
    mocks.opportunity.findFirst.mockResolvedValue({
      ...baseOpportunity,
      companyId: "company-2",
    });
    const result = await isProviderEligibleForOpportunity("provider-1", "opp-1");
    expect(result.eligible).toBe(false);
    expect(result.warnings.some((w) => w.includes("different companies"))).toBe(true);
  });
});
