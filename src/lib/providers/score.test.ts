import { describe, expect, it } from "vitest";
import { calculateCompletenessScore } from "@/lib/providers/score";
import type { Provider } from "@/generated/prisma/client";

const baseProvider = {
  id: "provider-1",
  userId: "user-1",
  status: "DRAFT" as const,
  businessName: null,
  timeZone: null,
  professionalTitle: null,
  biography: null,
  cvStorageKey: null,
  portfolioUrl: null,
  yearsOfExperience: null,
  languages: [] as string[],
  expectedRateMin: null,
  expectedRateMax: null,
  linkedinUrl: null,
  githubUrl: null,
  websiteUrl: null,
  businessLegalInfo: null,
  vatInfo: null,
  preferredProjectTypes: [] as string[],
  completenessScore: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("calculateCompletenessScore", () => {
  it("returns 0 for empty provider", () => {
    expect(calculateCompletenessScore(baseProvider as Provider)).toBe(0);
  });

  it("returns 100 for fully complete provider", () => {
    const complete = {
      ...baseProvider,
      professionalTitle: "Engineer",
      biography: "A".repeat(50),
      yearsOfExperience: 5,
      expectedRateMin: 100,
      expectedRateMax: 200,
      businessLegalInfo: "Legal info",
      cvStorageKey: "cv.pdf",
      portfolioUrl: "https://example.com",
      languages: ["en"],
      linkedinUrl: "https://linkedin.com",
      githubUrl: "https://github.com",
      websiteUrl: "https://example.com",
      vatInfo: "VAT123",
    } as unknown as Provider;
    expect(calculateCompletenessScore(complete)).toBe(100);
  });

  it("returns 60 for all required fields only", () => {
    const requiredOnly = {
      ...baseProvider,
      professionalTitle: "Engineer",
      biography: "A".repeat(50),
      yearsOfExperience: 5,
      expectedRateMin: 100,
      expectedRateMax: 200,
      businessLegalInfo: "Legal info",
    } as unknown as Provider;
    const score = calculateCompletenessScore(requiredOnly);
    expect(score).toBeGreaterThanOrEqual(60);
  });

  it("uses businessName as fallback for business info", () => {
    const withBusinessName = {
      ...baseProvider,
      professionalTitle: "Engineer",
      biography: "A".repeat(50),
      yearsOfExperience: 5,
      expectedRateMin: 100,
      expectedRateMax: 200,
      businessName: "Acme Corp",
    } as unknown as Provider;
    const score = calculateCompletenessScore(withBusinessName);
    expect(score).toBeGreaterThanOrEqual(60);
  });
});
