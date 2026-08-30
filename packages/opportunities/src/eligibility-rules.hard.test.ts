import type {
  Opportunity,
  Provider,
  ProviderAbsence,
  ProviderWeeklyCapacity,
} from "@platform/db/client";

import { Prisma } from "@platform/db/client";
import { describe, expect, it } from "vitest";

import {
  checkAvailabilityWindow,
  checkBudgetOverlap,
  checkCommercialReadiness,
  checkProviderStatus,
} from "./eligibility-rules";

const baseProvider = {
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
  budgetMin: new Prisma.Decimal(150),
  budgetMax: new Prisma.Decimal(250),
  startDate: new Date("2026-09-01"),
  deadline: new Date("2026-09-30"),
  locationTimezone: "Europe/London",
  languages: ["en"],
  requiredSkills: ["web"],
  preferredSkills: ["mobile"],
} as unknown as Opportunity;

describe("checkProviderStatus", () => {
  it("passes for ACTIVE provider", () => {
    const result = checkProviderStatus(baseProvider);
    expect(result.passed).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("fails for non-ACTIVE provider", () => {
    const result = checkProviderStatus({
      ...baseProvider,
      status: "SUSPENDED",
    } as unknown as Provider);
    expect(result.passed).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("checkCommercialReadiness", () => {
  it("passes for READY commercial status", () => {
    const result = checkCommercialReadiness(baseProvider);
    expect(result.passed).toBe(true);
  });

  it("fails for non-READY commercial status", () => {
    const result = checkCommercialReadiness({
      ...baseProvider,
      commercialStatus: "NOT_READY",
    } as unknown as Provider);
    expect(result.passed).toBe(false);
  });
});

describe("checkBudgetOverlap", () => {
  it("passes when ranges overlap", () => {
    const result = checkBudgetOverlap(baseProvider, baseOpportunity);
    expect(result.passed).toBe(true);
  });

  it("fails when ranges do not overlap", () => {
    const provider = { ...baseProvider, expectedRateMin: 300, expectedRateMax: 400 };
    const result = checkBudgetOverlap(provider as unknown as Provider, baseOpportunity);
    expect(result.passed).toBe(false);
  });

  it("warns when provider rate is missing", () => {
    const provider = { ...baseProvider, expectedRateMin: null, expectedRateMax: null };
    const result = checkBudgetOverlap(provider as unknown as Provider, baseOpportunity);
    expect(result.passed).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("warns when opportunity budget is missing", () => {
    const opportunity = { ...baseOpportunity, budgetMin: null, budgetMax: null };
    const result = checkBudgetOverlap(baseProvider, opportunity as unknown as Opportunity);
    expect(result.passed).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("checkAvailabilityWindow", () => {
  it("passes when provider has available hours", () => {
    const weeklyCapacity: ProviderWeeklyCapacity[] = [
      {
        id: "c1",
        providerId: "p1",
        weekday: 1,
        hoursPerDay: new Prisma.Decimal(8),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const result = checkAvailabilityWindow(baseProvider, baseOpportunity, weeklyCapacity, []);
    expect(result.passed).toBe(true);
  });

  it("warns when opportunity has no dates", () => {
    const opportunity = { ...baseOpportunity, startDate: null, deadline: null };
    const result = checkAvailabilityWindow(
      baseProvider,
      opportunity as unknown as Opportunity,
      [],
      [],
    );
    expect(result.passed).toBe(true);
    expect(result.warnings.some((w) => w.includes("no start date"))).toBe(true);
  });

  it("warns when provider has no capacity entries", () => {
    const result = checkAvailabilityWindow(baseProvider, baseOpportunity, [], []);
    expect(result.passed).toBe(true);
    expect(result.warnings.some((w) => w.includes("no weekly capacity"))).toBe(true);
  });

  it("fails when approved absence covers entire window", () => {
    const weeklyCapacity: ProviderWeeklyCapacity[] = [
      {
        id: "c1",
        providerId: "p1",
        weekday: 1,
        hoursPerDay: new Prisma.Decimal(8),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const absences: ProviderAbsence[] = [
      {
        id: "a1",
        providerId: "p1",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-09-30"),
        reason: null,
        status: "APPROVED",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const result = checkAvailabilityWindow(baseProvider, baseOpportunity, weeklyCapacity, absences);
    expect(result.passed).toBe(false);
  });
});
