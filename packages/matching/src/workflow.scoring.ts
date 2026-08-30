import type { Opportunity, Provider, ProviderService } from "@platform/db/client";

import {
  checkAvailabilityWindow,
  checkBudgetOverlap,
  checkCommercialReadiness,
  checkLanguageOverlap,
  checkProviderStatus,
  checkSkillOverlap,
  checkTimezoneOverlap,
} from "@platform/opportunities/eligibility-rules";

import type { CandidateScore, EffectiveWeights } from "./types";

import { buildExplanation } from "./explanation";
import { scoreCandidate } from "./scoring";

export function scoreProvider(
  provider: Provider,
  opportunity: Opportunity,
  weights: EffectiveWeights,
): { eligibilityWarnings: string[] } & CandidateScore {
  const eligibilityWarnings: string[] = [];
  let eligibilityPassed = true;

  const statusResult = checkProviderStatus(provider);
  if (!statusResult.passed) eligibilityPassed = false;
  eligibilityWarnings.push(...statusResult.warnings);

  const commercialResult = checkCommercialReadiness(provider);
  if (!commercialResult.passed) eligibilityPassed = false;
  eligibilityWarnings.push(...commercialResult.warnings);

  const budgetResult = checkBudgetOverlap(provider, opportunity);
  if (!budgetResult.passed) eligibilityPassed = false;
  eligibilityWarnings.push(...budgetResult.warnings);

  const weeklyCapacity = (
    provider as unknown as { weeklyCapacity: { weekday: number; hoursPerDay: number }[] }
  ).weeklyCapacity;
  const absences = (
    provider as unknown as { absences: { status: string; startDate: Date; endDate: Date }[] }
  ).absences;
  const services = (provider as unknown as { services: ProviderService[] }).services;

  const availabilityResult = checkAvailabilityWindow(
    provider,
    opportunity,
    weeklyCapacity as unknown as Parameters<typeof checkAvailabilityWindow>[2],
    absences as unknown as Parameters<typeof checkAvailabilityWindow>[3],
  );
  if (!availabilityResult.passed) eligibilityPassed = false;
  eligibilityWarnings.push(...availabilityResult.warnings);

  const timezoneResult = checkTimezoneOverlap(provider, opportunity);
  eligibilityWarnings.push(...timezoneResult.warnings);

  const languageResult = checkLanguageOverlap(provider, opportunity);
  eligibilityWarnings.push(...languageResult.warnings);

  const skillResult = checkSkillOverlap(provider, opportunity, services);
  eligibilityWarnings.push(...skillResult.warnings);

  const publishedServices = services.filter((s) => s.status === "PUBLISHED");

  const scoreDimensions = scoreCandidate(
    provider,
    opportunity,
    weights,
    eligibilityWarnings,
    publishedServices,
    weeklyCapacity,
    absences,
  );

  const overallScore = scoreDimensions.reduce((sum, dim) => sum + (dim.weighted ?? 0), 0);
  const { explanation } = buildExplanation({
    dimensions: scoreDimensions,
    eligibilityWarnings,
  });

  return {
    providerId: provider.id,
    overallScore,
    eligibilityPassed,
    scoreBreakdown: scoreDimensions,
    explanation,
    warnings: eligibilityWarnings,
    eligibilityWarnings,
  };
}
