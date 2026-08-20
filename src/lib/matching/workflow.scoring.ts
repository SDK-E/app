import type { EffectiveWeights } from "./types";
import type { Opportunity, Provider, ProviderService } from "@/generated/prisma/client";
import {
  checkProviderStatus,
  checkCommercialReadiness,
  checkBudgetOverlap,
  checkAvailabilityWindow,
  checkTimezoneOverlap,
  checkLanguageOverlap,
  checkSkillOverlap,
} from "./eligibility";
import { scoreCandidate } from "./scoring";
import { buildExplanation } from "./explanation";
import type { CandidateScore } from "./types";

export function scoreProvider(
  provider: Provider,
  opportunity: Opportunity,
  weights: EffectiveWeights
): CandidateScore & { eligibilityWarnings: string[] } {
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
    absences as unknown as Parameters<typeof checkAvailabilityWindow>[3]
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
    absences
  );

  const overallScore = scoreDimensions.reduce((sum, dim) => sum + dim.weighted!, 0);
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
