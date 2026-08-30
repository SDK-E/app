import { buildExplanation } from "@platform/matching/explanation";
import { describe, expect, it } from "vitest";

describe("buildExplanation", () => {
  it("generates explanation fragments for each dimension", () => {
    const { explanation } = buildExplanation({
      dimensions: [
        { name: "skills", raw: 80, weighted: 10, matchQuality: "strong" },
        { name: "seniority", raw: 50, weighted: 6, matchQuality: "good" },
        { name: "rate", raw: 60, weighted: 7, matchQuality: "moderate" },
        { name: "availability", raw: 90, weighted: 11, matchQuality: "strong" },
        { name: "location", raw: 100, weighted: 12, matchQuality: "strong" },
        { name: "language", raw: 100, weighted: 12, matchQuality: "strong" },
        { name: "completeness", raw: 80, weighted: 10, matchQuality: "strong" },
        { name: "serviceFit", raw: 70, weighted: 8, matchQuality: "good" },
      ],
      eligibilityWarnings: ["Warning 1"],
    });
    expect(explanation).toHaveLength(8);
    expect(explanation[0].detail).toContain("skill");
    expect(explanation[1].detail).toContain("seniority");
  });

  it("passes through eligibility warnings", () => {
    const { warnings } = buildExplanation({
      dimensions: [],
      eligibilityWarnings: ["Missing timezone", "Budget mismatch"],
    });
    expect(warnings).toEqual(["Missing timezone", "Budget mismatch"]);
  });
});
