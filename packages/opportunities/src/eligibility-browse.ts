import { getPrisma } from "@sdk-e/db";
import type { ProviderPrincipal } from "@sdk-e/types";
import {
  checkProviderStatus,
  checkCommercialReadiness,
  checkBudgetOverlap,
  checkAvailabilityWindow,
  type EligibilityResult,
} from "./eligibility-rules";

export interface EligibilityOutcome {
  eligible: boolean;
  warnings: string[];
}

export async function isProviderEligibleForOpportunity(
  providerId: string,
  opportunityId: string
): Promise<EligibilityOutcome> {
  const [provider, opportunity, weeklyCapacity, absences] = await Promise.all([
    getPrisma().provider.findFirst({ where: { id: providerId } }),
    getPrisma().opportunity.findFirst({ where: { id: opportunityId } }),
    getPrisma().providerWeeklyCapacity.findMany({ where: { providerId } }),
    getPrisma().providerAbsence.findMany({ where: { providerId, status: "APPROVED" } }),
  ]);

  if (!provider || !opportunity) {
    return { eligible: false, warnings: ["Missing provider or opportunity"] };
  }

  if (provider.companyId && opportunity.companyId !== provider.companyId) {
    return {
      eligible: false,
      warnings: ["Provider and opportunity are in different companies"],
    };
  }

  const checks: EligibilityResult[] = [
    checkProviderStatus(provider),
    checkCommercialReadiness(provider),
    checkBudgetOverlap(provider, opportunity),
    checkAvailabilityWindow(provider, opportunity, weeklyCapacity, absences),
  ];

  const failed = checks.filter((c) => !c.passed);
  const warnings = checks.flatMap((c) => c.warnings);

  let eligible = failed.length === 0;

  // For provider browsing, a provider with no recorded weekly capacity cannot be
  // staffed, so the soft warning from `checkAvailabilityWindow` is treated as a
  // hard fail here. This is browse-specific and does not alter matching semantics.
  if (eligible && weeklyCapacity.length === 0) {
    eligible = false;
    warnings.push("Provider has no weekly capacity entries");
  }

  return { eligible, warnings };
}

export async function isProviderEligible(
  principal: ProviderPrincipal,
  opportunityId: string
): Promise<EligibilityOutcome> {
  return isProviderEligibleForOpportunity(principal.providerId, opportunityId);
}
