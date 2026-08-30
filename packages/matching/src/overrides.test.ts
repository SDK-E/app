import { describe, expect, it } from "vitest";
import { applyOverrides } from "@sdk-e/matching/overrides";
import type { MatchCandidateResult, OverrideInput } from "@sdk-e/matching/types";

describe("applyOverrides", () => {
  const baseCandidate: MatchCandidateResult = {
    providerId: "provider-1",
    overallScore: 50,
    eligibilityPassed: true,
    scoreBreakdown: [],
    explanation: [],
    warnings: [],
  };

  it("boosts score by 15", () => {
    const overrides: OverrideInput[] = [
      {
        companyId: "c1",
        opportunityId: "o1",
        providerId: "provider-1",
        type: "BOOST",
        reason: "Good fit",
        actorId: "user-1",
        active: true,
      },
    ];
    const result = applyOverrides([baseCandidate], overrides);
    expect(result[0].overallScore).toBe(65);
  });

  it("suppresses score by 20", () => {
    const overrides: OverrideInput[] = [
      {
        companyId: "c1",
        opportunityId: "o1",
        providerId: "provider-1",
        type: "SUPPRESS",
        reason: "Rates too high",
        actorId: "user-1",
        active: true,
      },
    ];
    const result = applyOverrides([baseCandidate], overrides);
    expect(result[0].overallScore).toBe(30);
  });

  it("excludes provider", () => {
    const overrides: OverrideInput[] = [
      {
        companyId: "c1",
        opportunityId: "o1",
        providerId: "provider-1",
        type: "EXCLUDE",
        reason: "Conflict",
        actorId: "user-1",
        active: true,
      },
    ];
    const result = applyOverrides([baseCandidate], overrides);
    expect(result[0].eligibilityPassed).toBe(false);
    expect(result[0].overallScore).toBe(0);
  });

  it("ignores inactive overrides", () => {
    const overrides: OverrideInput[] = [
      {
        companyId: "c1",
        opportunityId: "o1",
        providerId: "provider-1",
        type: "BOOST",
        reason: "Good fit",
        actorId: "user-1",
        active: false,
      },
    ];
    const result = applyOverrides([baseCandidate], overrides);
    expect(result[0].overallScore).toBe(50);
  });

  it("does not modify candidates without overrides", () => {
    const result = applyOverrides([baseCandidate], []);
    expect(result[0]).toEqual(baseCandidate);
  });

  it("clamps score to 0-100", () => {
    const overrides: OverrideInput[] = [
      {
        companyId: "c1",
        opportunityId: "o1",
        providerId: "provider-1",
        type: "BOOST",
        reason: "Good fit",
        actorId: "user-1",
        active: true,
      },
    ];
    const highCandidate = { ...baseCandidate, overallScore: 95 };
    const result = applyOverrides([highCandidate], overrides);
    expect(result[0].overallScore).toBe(100);
  });
});
