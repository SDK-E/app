import type { Opportunity, Provider, ProviderService } from "@platform/db/client";

import type { EffectiveWeights, ScoreDimension } from "./types";

import {
  qualityLabel,
  scoreAvailability,
  scoreCompleteness,
  scoreLanguage,
  scoreLocation,
  scoreRate,
  scoreSeniority,
  scoreServiceFit,
  scoreSkills,
} from "./scoring-helpers";

export function scoreCandidate(
  provider: Provider,
  opportunity: Opportunity,
  weights: EffectiveWeights,
  eligibilityWarnings: string[],
  services: ProviderService[],
  weeklyCapacity: { weekday: number; hoursPerDay: number }[],
  absences: { status: string; startDate: Date; endDate: Date }[],
): ScoreDimension[] {
  const dimensions: ScoreDimension[] = [];

  const skillScore = scoreSkills(provider, opportunity, services);
  dimensions.push({ name: "skills", ...skillScore, matchQuality: qualityLabel(skillScore.raw) });

  const seniorityScore = scoreSeniority(provider);
  dimensions.push({
    name: "seniority",
    ...seniorityScore,
    matchQuality: qualityLabel(seniorityScore.raw),
  });

  const rateScore = scoreRate(provider, opportunity);
  dimensions.push({ name: "rate", ...rateScore, matchQuality: qualityLabel(rateScore.raw) });

  const availabilityScore = scoreAvailability(provider, opportunity, weeklyCapacity, absences);
  dimensions.push({
    name: "availability",
    ...availabilityScore,
    matchQuality: qualityLabel(availabilityScore.raw),
  });

  const locationScore = scoreLocation(provider, opportunity);
  dimensions.push({
    name: "location",
    ...locationScore,
    matchQuality: qualityLabel(locationScore.raw),
  });

  const languageScore = scoreLanguage(provider, opportunity);
  dimensions.push({
    name: "language",
    ...languageScore,
    matchQuality: qualityLabel(languageScore.raw),
  });

  const completenessScore = scoreCompleteness(provider);
  dimensions.push({
    name: "completeness",
    ...completenessScore,
    matchQuality: qualityLabel(completenessScore.raw),
  });

  const serviceFitScore = scoreServiceFit(services, opportunity);
  dimensions.push({
    name: "serviceFit",
    ...serviceFitScore,
    matchQuality: qualityLabel(serviceFitScore.raw),
  });

  const weightMap: Record<string, number> = {
    skills: weights.skillMatch,
    seniority: weights.seniority,
    rate: weights.rate,
    availability: weights.availability,
    location: weights.location,
    language: weights.language,
    completeness: weights.completeness,
    serviceFit: weights.serviceFit,
  };

  for (const dim of dimensions) {
    dim.weighted = Math.round((dim.raw / 100) * weightMap[dim.name]);
  }

  return dimensions;
}
