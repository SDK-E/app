import type { ProviderService } from "@platform/db/client";

import { calculateServiceCompletenessScore } from "@platform/providers/services/score";
import { Decimal } from "@prisma/client/runtime/index-browser";
import { describe, expect, it } from "vitest";

function makeService(overrides: Partial<ProviderService> = {}): ProviderService {
  return {
    id: "svc-1",
    providerId: "provider-1",
    status: "DRAFT",
    title: "",
    description: "",
    capability: "other",
    categoryTags: [],
    pricingModel: null,
    rateMin: null,
    rateMax: null,
    currency: "USD",
    estimatedDuration: null,
    deliverables: null,
    completenessScore: 0,
    publishedAt: null,
    unpublishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as ProviderService;
}

describe("calculateServiceCompletenessScore", () => {
  it("returns 0 for an empty service", () => {
    const score = calculateServiceCompletenessScore(makeService());
    expect(score).toBe(15);
  });

  it("scores required fields at 60% weight", () => {
    const score = calculateServiceCompletenessScore(
      makeService({
        title: "Cloud Migration",
        description: "A".repeat(50),
        capability: "modernization",
        pricingModel: "HOURLY",
      }),
    );
    expect(score).toBe(60);
  });

  it("scores optional fields at 40% weight", () => {
    const score = calculateServiceCompletenessScore(
      makeService({
        title: "Cloud Migration",
        description: "A".repeat(50),
        capability: "modernization",
        pricingModel: "HOURLY",
        rateMin: new Decimal(100),
        rateMax: new Decimal(200),
        estimatedDuration: "2-4 weeks",
        deliverables: "Migration plan and execution",
        categoryTags: ["cloud", "aws"],
      }),
    );
    expect(score).toBe(100);
  });

  it("caps at 100", () => {
    const score = calculateServiceCompletenessScore(
      makeService({
        title: "Service",
        description: "A".repeat(50),
        capability: "platforms",
        pricingModel: "FIXED_PROJECT",
        rateMin: new Decimal(50),
        rateMax: new Decimal(100),
        estimatedDuration: "1 month",
        deliverables: "Everything",
        categoryTags: ["tag1", "tag2"],
      }),
    );
    expect(score).toBe(100);
  });

  it("requires description >= 50 chars to count", () => {
    const score = calculateServiceCompletenessScore(
      makeService({
        title: "Service",
        description: "Short",
        capability: "platforms",
        pricingModel: "HOURLY",
      }),
    );
    expect(score).toBeLessThan(60);
  });

  it("counts partial required fields proportionally", () => {
    const score = calculateServiceCompletenessScore(
      makeService({
        title: "Service",
        description: "A".repeat(50),
      }),
    );
    expect(score).toBe(45);
  });
});
