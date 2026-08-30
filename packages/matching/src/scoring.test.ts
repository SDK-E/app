import type { Opportunity, Provider, ProviderService } from "@platform/db/client";

import { scoreCandidate } from "@platform/matching/scoring";
import { DEFAULT_WEIGHTS } from "@platform/matching/weights";
import { describe, expect, it } from "vitest";

const baseProvider = {
  id: "provider-1",
  status: "ACTIVE" as const,
  commercialStatus: "READY" as const,
  timeZone: "Europe/London",
  languages: ["en"],
  preferredProjectTypes: ["web"],
  yearsOfExperience: 5,
  expectedRateMin: 100,
  expectedRateMax: 200,
  defaultDailyHours: 8,
} as unknown as Provider;

const baseOpportunity = {
  id: "opp-1",
  budgetMin: 150,
  budgetMax: 250,
  startDate: new Date("2026-09-01"),
  deadline: new Date("2026-09-30"),
  locationTimezone: "Europe/London",
  languages: ["en"],
  requiredSkills: ["web"],
  preferredSkills: [],
} as unknown as Opportunity;

describe("scoreCandidate", () => {
  it("returns 8 dimensions", () => {
    const dimensions = scoreCandidate(
      baseProvider,
      baseOpportunity,
      DEFAULT_WEIGHTS,
      [],
      [],
      [],
      [],
    );
    expect(dimensions).toHaveLength(8);
  });

  it("produces deterministic scores for identical inputs", () => {
    const a = scoreCandidate(baseProvider, baseOpportunity, DEFAULT_WEIGHTS, [], [], [], []);
    const b = scoreCandidate(baseProvider, baseOpportunity, DEFAULT_WEIGHTS, [], [], [], []);
    expect(a).toEqual(b);
  });

  it("derives seniority from yearsOfExperience", () => {
    const junior = scoreCandidate(
      { ...baseProvider, yearsOfExperience: 1 } as unknown as Provider,
      baseOpportunity,
      DEFAULT_WEIGHTS,
      [],
      [],
      [],
      [],
    );
    const senior = scoreCandidate(
      { ...baseProvider, yearsOfExperience: 8 } as unknown as Provider,
      baseOpportunity,
      DEFAULT_WEIGHTS,
      [],
      [],
      [],
      [],
    );
    const juniorSeniority = junior.find((d) => d.name === "seniority");
    const seniorSeniority = senior.find((d) => d.name === "seniority");
    expect(juniorSeniority?.raw).toBeLessThan(seniorSeniority?.raw ?? 0);
  });

  it("scores service fit based on published services", () => {
    const services: ProviderService[] = [
      {
        id: "s1",
        providerId: "p1",
        status: "PUBLISHED",
        title: "Web",
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
    const dimensions = scoreCandidate(
      baseProvider,
      baseOpportunity,
      DEFAULT_WEIGHTS,
      [],
      services,
      [],
      [],
    );
    const serviceFit = dimensions.find((d) => d.name === "serviceFit");
    expect(serviceFit?.raw).toBe(100);
  });

  it("returns 0 service fit when no published services match", () => {
    const services: ProviderService[] = [
      {
        id: "s1",
        providerId: "p1",
        status: "PUBLISHED",
        title: "Mobile",
        description: "",
        capability: "other",
        categoryTags: ["mobile"],
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
    const dimensions = scoreCandidate(
      baseProvider,
      { ...baseOpportunity, requiredSkills: ["data-science"] } as unknown as Opportunity,
      DEFAULT_WEIGHTS,
      [],
      services,
      [],
      [],
    );
    const serviceFit = dimensions.find((d) => d.name === "serviceFit");
    expect(serviceFit?.raw).toBe(0);
  });
});
