import type {
  Opportunity,
  Provider,
  ProviderAbsence,
  ProviderService,
  ProviderWeeklyCapacity,
} from "@/generated/prisma/client";
import type { EligibilityResult } from "./types";

export function checkProviderStatus(provider: Provider): EligibilityResult {
  if (provider.status === "ACTIVE") {
    return { passed: true, warnings: [] };
  }
  return { passed: false, warnings: [`Provider status is ${provider.status}, expected ACTIVE`] };
}

export function checkCommercialReadiness(provider: Provider): EligibilityResult {
  if (provider.commercialStatus === "READY") {
    return { passed: true, warnings: [] };
  }
  return {
    passed: false,
    warnings: [`Provider commercial status is ${provider.commercialStatus}, expected READY`],
  };
}

export function checkBudgetOverlap(
  provider: Provider,
  opportunity: Opportunity
): EligibilityResult {
  const warnings: string[] = [];
  if (provider.expectedRateMin == null || provider.expectedRateMax == null) {
    warnings.push("Provider expected rate range is incomplete");
    return { passed: true, warnings };
  }
  if (opportunity.budgetMin == null || opportunity.budgetMax == null) {
    warnings.push("Opportunity budget range is incomplete");
    return { passed: true, warnings };
  }
  const providerMin = Number(provider.expectedRateMin);
  const providerMax = Number(provider.expectedRateMax);
  const oppMin = Number(opportunity.budgetMin);
  const oppMax = Number(opportunity.budgetMax);
  const overlaps = providerMax >= oppMin && providerMin <= oppMax;
  if (overlaps) {
    return { passed: true, warnings };
  }
  return {
    passed: false,
    warnings: ["Provider rate range does not overlap with opportunity budget"],
  };
}

export function checkAvailabilityWindow(
  provider: Provider,
  opportunity: Opportunity,
  weeklyCapacity: ProviderWeeklyCapacity[],
  absences: ProviderAbsence[]
): EligibilityResult {
  const warnings: string[] = [];
  if (!opportunity.startDate || !opportunity.deadline) {
    warnings.push("Opportunity has no start date or deadline");
    return { passed: true, warnings };
  }
  if (weeklyCapacity.length === 0) {
    warnings.push("Provider has no weekly capacity entries");
    return { passed: true, warnings };
  }
  const start = new Date(opportunity.startDate);
  const end = new Date(opportunity.deadline);
  if (start >= end) {
    warnings.push("Opportunity start date is after deadline");
    return { passed: true, warnings };
  }
  const approvedAbsences = absences.filter((a) => a.status === "APPROVED");
  let totalAvailableHours = 0;
  const current = new Date(start);
  while (current <= end) {
    const weekday = current.getDay();
    const dayCapacity = weeklyCapacity.find((c) => c.weekday === weekday);
    if (dayCapacity) {
      const hours = Number(dayCapacity.hoursPerDay);
      const dayAbsence = approvedAbsences.find((a) => {
        const absStart = new Date(a.startDate);
        const absEnd = new Date(a.endDate);
        return current >= absStart && current <= absEnd;
      });
      if (!dayAbsence) {
        totalAvailableHours += hours;
      }
    }
    current.setDate(current.getDate() + 1);
  }
  if (totalAvailableHours > 0) {
    return { passed: true, warnings };
  }
  return { passed: false, warnings: ["Provider has no available hours during opportunity window"] };
}

export function checkTimezoneOverlap(
  provider: Provider,
  opportunity: Opportunity
): EligibilityResult {
  const warnings: string[] = [];
  if (!provider.timeZone || !opportunity.locationTimezone) {
    warnings.push("Provider or opportunity timezone is missing");
    return { passed: true, warnings };
  }
  const providerOffset = getUtcOffsetHours(provider.timeZone);
  const opportunityOffset = getUtcOffsetHours(opportunity.locationTimezone);
  if (providerOffset == null || opportunityOffset == null) {
    warnings.push("Could not determine UTC offset for timezone overlap");
    return { passed: true, warnings };
  }
  const diff = Math.abs(providerOffset - opportunityOffset);
  if (diff <= 3) {
    return { passed: true, warnings };
  }
  return {
    passed: true,
    warnings: [`Timezone offset difference is ${diff} hours, exceeds ±3 hours`],
  };
}

export function checkLanguageOverlap(
  provider: Provider,
  opportunity: Opportunity
): EligibilityResult {
  const warnings: string[] = [];
  if (opportunity.languages.length === 0) {
    return { passed: true, warnings };
  }
  const providerLangs = new Set(provider.languages.map((l) => l.toLowerCase()));
  const missing = opportunity.languages.filter((l) => !providerLangs.has(l.toLowerCase()));
  if (missing.length === 0) {
    return { passed: true, warnings };
  }
  return { passed: true, warnings: [`Provider missing required languages: ${missing.join(", ")}`] };
}

export function checkSkillOverlap(
  provider: Provider,
  opportunity: Opportunity,
  services: ProviderService[]
): EligibilityResult {
  const warnings: string[] = [];
  const oppSkills = new Set(
    [...opportunity.requiredSkills, ...opportunity.preferredSkills].map((s) => s.toLowerCase())
  );
  if (oppSkills.size === 0) {
    return { passed: true, warnings };
  }
  const providerSkills = new Set(provider.preferredProjectTypes.map((s) => s.toLowerCase()));
  const serviceTags = new Set<string>();
  const serviceCaps = new Set<string>();
  for (const service of services) {
    if (service.status === "PUBLISHED") {
      for (const tag of service.categoryTags) {
        serviceTags.add(tag.toLowerCase());
      }
      serviceCaps.add(service.capability.toLowerCase());
    }
  }
  const allProviderSkills = new Set([...providerSkills, ...serviceTags, ...serviceCaps]);
  const matched = [...oppSkills].filter((s) => allProviderSkills.has(s)).length;
  if (matched > 0) {
    return { passed: true, warnings };
  }
  return { passed: true, warnings: ["No skill overlap detected between provider and opportunity"] };
}

function getUtcOffsetHours(timeZone: string): number | null {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    if (!offsetPart) return null;
    const match = offsetPart.value.match(/GMT([+-]?\d+(?::\d+)?)/);
    if (!match) return null;
    const offset = match[1] as string;
    const [hours, minutes = "0"] = offset.split(":").map(Number);
    const sign = offset.startsWith("-") ? -1 : 1;
    return sign * (Math.abs(hours as number) + (minutes as number) / 60);
  } catch {
    return null;
  }
}
