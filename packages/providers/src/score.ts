import type { Provider } from "@platform/db/client";

export function calculateCompletenessScore(provider: Provider): number {
  const requiredFields = [
    provider.professionalTitle,
    provider.biography && provider.biography.length >= 50 ? provider.biography : null,
    provider.yearsOfExperience !== null && provider.yearsOfExperience !== undefined,
    provider.expectedRateMin !== null && provider.expectedRateMin !== undefined,
    provider.expectedRateMax !== null && provider.expectedRateMax !== undefined,
    provider.businessLegalInfo || provider.businessName,
  ];

  const requiredCount = requiredFields.filter(Boolean).length;
  const requiredWeight = 60;
  const requiredScore = (requiredCount / requiredFields.length) * requiredWeight;

  const optionalFields = [
    provider.cvStorageKey,
    provider.portfolioUrl,
    provider.languages && provider.languages.length > 0,
    provider.linkedinUrl,
    provider.githubUrl,
    provider.websiteUrl,
    provider.vatInfo,
  ];

  const optionalCount = optionalFields.filter(Boolean).length;
  const optionalWeight = 40;
  const optionalScore = (optionalCount / optionalFields.length) * optionalWeight;

  return Math.min(100, Math.round(requiredScore + optionalScore));
}
