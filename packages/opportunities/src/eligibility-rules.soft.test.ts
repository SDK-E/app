import { describe, expect, it } from "vitest";
import type { Opportunity, Provider } from "@sdk-e/db/client";
import type { ProviderService } from "@sdk-e/db/client";
import { Prisma } from "@sdk-e/db/client";
import { checkTimezoneOverlap, checkLanguageOverlap, checkSkillOverlap } from "./eligibility-rules";

const baseProvider = {
  status: "ACTIVE" as const,
  commercialStatus: "READY" as const,
  timeZone: "Europe/London",
  languages: ["en"],
  preferredProjectTypes: ["web"],
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
  preferredSkills: [],
} as unknown as Opportunity;

describe("checkTimezoneOverlap", () => {
  it("passes when timezones are within ±3 hours", () => {
    const result = checkTimezoneOverlap(baseProvider, baseOpportunity);
    expect(result.passed).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns when timezone is missing", () => {
    const result = checkTimezoneOverlap(
      { ...baseProvider, timeZone: null } as unknown as Provider,
      baseOpportunity
    );
    expect(result.warnings.some((w) => w.includes("missing"))).toBe(true);
  });

  it("warns when offset difference exceeds 3 hours", () => {
    const provider = { ...baseProvider, timeZone: "America/New_York" };
    const result = checkTimezoneOverlap(provider as unknown as Provider, baseOpportunity);
    expect(result.warnings.some((w) => w.includes("exceeds"))).toBe(true);
  });
});

describe("checkLanguageOverlap", () => {
  it("passes when provider has all required languages", () => {
    const result = checkLanguageOverlap(baseProvider, baseOpportunity);
    expect(result.passed).toBe(true);
  });

  it("warns when provider is missing required languages", () => {
    const opportunity = { ...baseOpportunity, languages: ["de"] };
    const result = checkLanguageOverlap(baseProvider, opportunity as unknown as Opportunity);
    expect(result.warnings.some((w) => w.includes("de"))).toBe(true);
  });

  it("passes without warnings when opportunity has no language requirements", () => {
    const opportunity = { ...baseOpportunity, languages: [] };
    const result = checkLanguageOverlap(baseProvider, opportunity as unknown as Opportunity);
    expect(result.passed).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});

describe("checkSkillOverlap", () => {
  it("passes when provider skills match opportunity", () => {
    const services: ProviderService[] = [];
    const result = checkSkillOverlap(baseProvider, baseOpportunity, services);
    expect(result.passed).toBe(true);
  });

  it("warns when no skill overlap is detected", () => {
    const provider = { ...baseProvider, preferredProjectTypes: ["blockchain"] };
    const services: ProviderService[] = [];
    const result = checkSkillOverlap(provider as unknown as Provider, baseOpportunity, services);
    expect(result.warnings.some((w) => w.includes("No skill overlap"))).toBe(true);
  });

  it("detects overlap via published service tags", () => {
    const provider = { ...baseProvider, preferredProjectTypes: [] };
    const services: ProviderService[] = [
      {
        id: "s1",
        providerId: "p1",
        status: "PUBLISHED",
        title: "Web Dev",
        description: "",
        capability: "other",
        categoryTags: ["web"],
        pricingModel: null,
        rateMin: null,
        rateMax: null,
        currency: "USD",
        estimatedDuration: null,
        deliverables: null,
        completenessScore: 0,
        publishedAt: new Date(),
        unpublishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const result = checkSkillOverlap(provider as unknown as Provider, baseOpportunity, services);
    expect(result.passed).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});
