import { DEFAULT_WEIGHTS, normalizeWeights, validateWeights } from "@platform/matching/weights";
import { describe, expect, it } from "vitest";

describe("normalizeWeights", () => {
  it("returns defaults when no overrides provided", () => {
    const result = normalizeWeights({});
    expect(result).toEqual(DEFAULT_WEIGHTS);
  });

  it("normalizes weights to sum to 100", () => {
    const result = normalizeWeights({
      skillMatch: 25,
      seniority: 25,
      rate: 25,
      availability: 25,
      location: 0,
      language: 0,
      completeness: 0,
      serviceFit: 0,
    });
    const sum = Object.values(result).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it("handles zero sum gracefully", () => {
    const result = normalizeWeights({
      skillMatch: 0,
      seniority: 0,
      rate: 0,
      availability: 0,
      location: 0,
      language: 0,
      completeness: 0,
      serviceFit: 0,
    });
    expect(result).toEqual(DEFAULT_WEIGHTS);
  });
});

describe("validateWeights", () => {
  it("returns no errors for valid weights", () => {
    expect(validateWeights(DEFAULT_WEIGHTS)).toHaveLength(0);
  });

  it("returns error when sum is not 100", () => {
    const errors = validateWeights({ ...DEFAULT_WEIGHTS, skillMatch: 50 });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for out of range values", () => {
    const errors = validateWeights({ ...DEFAULT_WEIGHTS, rate: 150 });
    expect(errors.some((e) => e.includes("rate"))).toBe(true);
  });
});
