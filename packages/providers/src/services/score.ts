import type { ProviderService } from "@sdk-e/db/client";

export function calculateServiceCompletenessScore(service: ProviderService): number {
  const requiredFields = [
    service.title,
    service.description && service.description.length >= 50 ? service.description : null,
    service.capability,
    service.pricingModel,
  ];

  const requiredCount = requiredFields.filter(Boolean).length;
  const requiredWeight = 60;
  const requiredScore = (requiredCount / requiredFields.length) * requiredWeight;

  const optionalFields = [
    service.rateMin !== null && service.rateMin !== undefined,
    service.rateMax !== null && service.rateMax !== undefined,
    service.estimatedDuration,
    service.deliverables,
    service.categoryTags && service.categoryTags.length > 0,
  ];

  const optionalCount = optionalFields.filter(Boolean).length;
  const optionalWeight = 40;
  const optionalScore = (optionalCount / optionalFields.length) * optionalWeight;

  return Math.min(100, Math.round(requiredScore + optionalScore));
}
