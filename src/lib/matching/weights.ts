import type { MatchWeightConfig } from "@/generated/prisma/client";
import type { EffectiveWeights } from "./types";

export const DEFAULT_WEIGHTS: EffectiveWeights = {
  skillMatch: 13,
  seniority: 13,
  rate: 13,
  availability: 13,
  location: 12,
  language: 12,
  completeness: 12,
  serviceFit: 12,
};

export function normalizeWeights(weights: Partial<EffectiveWeights>): EffectiveWeights {
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const sum =
    w.skillMatch +
    w.seniority +
    w.rate +
    w.availability +
    w.location +
    w.language +
    w.completeness +
    w.serviceFit;
  if (sum === 0) return DEFAULT_WEIGHTS;
  const factor = 100 / sum;
  return {
    skillMatch: Math.round(w.skillMatch * factor),
    seniority: Math.round(w.seniority * factor),
    rate: Math.round(w.rate * factor),
    availability: Math.round(w.availability * factor),
    location: Math.round(w.location * factor),
    language: Math.round(w.language * factor),
    completeness: Math.round(w.completeness * factor),
    serviceFit: Math.round(w.serviceFit * factor),
  };
}

export function validateWeights(weights: EffectiveWeights): string[] {
  const errors: string[] = [];
  const values = Object.values(weights) as number[];
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    errors.push(`Weights must sum to 100, got ${sum}`);
  }
  for (const [key, value] of Object.entries(weights)) {
    if (value < 0 || value > 100) {
      errors.push(`${key} must be between 0 and 100, got ${value}`);
    }
  }
  return errors;
}

export function prismaWeightsToEffective(weights: MatchWeightConfig): EffectiveWeights {
  return normalizeWeights({
    skillMatch: weights.skillMatchWeight,
    seniority: weights.seniorityWeight,
    rate: weights.rateWeight,
    availability: weights.availabilityWeight,
    location: weights.locationWeight,
    language: weights.languageWeight,
    completeness: weights.completenessWeight,
    serviceFit: weights.serviceFitWeight,
  });
}
