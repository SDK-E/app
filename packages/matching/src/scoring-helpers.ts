import type { Opportunity, Provider, ProviderService } from "@platform/db/client";

import { calculateCompletenessScore } from "@platform/providers/score";

export function qualityLabel(raw: number): string {
  if (raw >= 80) return "strong";
  if (raw >= 60) return "good";
  if (raw >= 40) return "moderate";
  if (raw >= 20) return "weak";
  return "poor";
}

export function scoreAvailability(
  provider: Provider,
  opportunity: Opportunity,
  weeklyCapacity: { weekday: number; hoursPerDay: number }[],
  absences: { status: string; startDate: Date; endDate: Date }[],
): { raw: number } {
  if (!opportunity.startDate || !opportunity.deadline) return { raw: 50 };
  if (weeklyCapacity.length === 0) return { raw: 50 };
  const start = new Date(opportunity.startDate);
  const end = new Date(opportunity.deadline);
  const approvedAbsences = absences.filter((a) => a.status === "APPROVED");
  let totalAvailable = 0;
  const current = new Date(start);
  while (current <= end) {
    const weekday = current.getDay();
    const dayCapacity = weeklyCapacity.find((c) => c.weekday === weekday);
    if (dayCapacity) {
      const hasAbsence = approvedAbsences.some((a) => {
        const absStart = new Date(a.startDate);
        const absEnd = new Date(a.endDate);
        return current >= absStart && current <= absEnd;
      });
      if (!hasAbsence) {
        totalAvailable += Number(dayCapacity.hoursPerDay);
      }
    }
    current.setDate(current.getDate() + 1);
  }
  if (provider.defaultDailyHours == null) return { raw: 50 };
  const expectedTotal =
    Number(provider.defaultDailyHours) *
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1);
  if (expectedTotal <= 0) return { raw: 50 };
  const raw = Math.min(100, Math.round((totalAvailable / expectedTotal) * 100));
  return { raw };
}

export function scoreCompleteness(provider: Provider): { raw: number } {
  return { raw: calculateCompletenessScore(provider) };
}

export function scoreLanguage(provider: Provider, opportunity: Opportunity): { raw: number } {
  if (opportunity.languages.length === 0) return { raw: 100 };
  const providerLangs = new Set(provider.languages.map((l) => l.toLowerCase()));
  const matched = opportunity.languages.filter((l) => providerLangs.has(l.toLowerCase())).length;
  return { raw: Math.round((matched / opportunity.languages.length) * 100) };
}

export function scoreLocation(provider: Provider, opportunity: Opportunity): { raw: number } {
  if (!provider.timeZone || !opportunity.locationTimezone) return { raw: 50 };
  const providerOffset = getUtcOffsetHours(provider.timeZone);
  const oppOffset = getUtcOffsetHours(opportunity.locationTimezone);
  if (providerOffset == null || oppOffset == null) return { raw: 50 };
  const diff = Math.abs(providerOffset - oppOffset);
  if (diff <= 3) return { raw: 100 };
  return { raw: Math.max(0, 100 - diff * 10) };
}

export function scoreRate(provider: Provider, opportunity: Opportunity): { raw: number } {
  if (provider.expectedRateMin == null || provider.expectedRateMax == null) return { raw: 50 };
  if (opportunity.budgetMin == null || opportunity.budgetMax == null) return { raw: 50 };
  const providerMin = Number(provider.expectedRateMin);
  const providerMax = Number(provider.expectedRateMax);
  const oppMin = Number(opportunity.budgetMin);
  const oppMax = Number(opportunity.budgetMax);
  const overlapMin = Math.max(providerMin, oppMin);
  const overlapMax = Math.min(providerMax, oppMax);
  if (overlapMax < overlapMin) return { raw: 0 };
  const overlapWidth = overlapMax - overlapMin;
  const providerWidth = providerMax - providerMin || 1;
  const raw = Math.min(100, Math.round((overlapWidth / providerWidth) * 100));
  return { raw };
}

export function scoreSeniority(provider: Provider): { raw: number } {
  const years = provider.yearsOfExperience;
  if (years == null) return { raw: 50 };
  if (years < 2) return { raw: 25 };
  if (years < 5) return { raw: 50 };
  if (years < 10) return { raw: 75 };
  return { raw: 100 };
}

export function scoreServiceFit(
  services: ProviderService[],
  opportunity: Opportunity,
): { raw: number } {
  const published = services.filter((s) => s.status === "PUBLISHED");
  if (published.length === 0) return { raw: 0 };
  const oppSkills = new Set(
    [...opportunity.requiredSkills, ...opportunity.preferredSkills].map((s) => s.toLowerCase()),
  );
  if (oppSkills.size === 0) return { raw: 50 };
  let matchCount = 0;
  for (const service of published) {
    const tags = service.categoryTags.map((t) => t.toLowerCase());
    const cap = service.capability.toLowerCase();
    if (tags.some((t) => oppSkills.has(t)) || oppSkills.has(cap)) {
      matchCount++;
    }
  }
  return { raw: Math.round((matchCount / published.length) * 100) };
}

export function scoreSkills(
  provider: Provider,
  opportunity: Opportunity,
  services: ProviderService[],
): { raw: number } {
  const oppRequired = opportunity.requiredSkills.map((s) => s.toLowerCase());
  const oppPreferred = opportunity.preferredSkills.map((s) => s.toLowerCase());
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

  let matchedRequired = 0;
  for (const skill of oppRequired) {
    if (allProviderSkills.has(skill)) matchedRequired++;
  }
  let matchedPreferred = 0;
  for (const skill of oppPreferred) {
    if (allProviderSkills.has(skill)) matchedPreferred++;
  }

  const requiredComponent =
    oppRequired.length > 0 ? (matchedRequired / oppRequired.length) * 70 : 0;
  const preferredComponent =
    oppPreferred.length > 0 ? (matchedPreferred / oppPreferred.length) * 30 : 0;
  const raw = Math.min(100, Math.round(requiredComponent + preferredComponent));
  return { raw };
}

function getUtcOffsetHours(timeZone: string): null | number {
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
