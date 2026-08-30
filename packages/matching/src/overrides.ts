import type { MatchCandidateResult, OverrideInput } from "./types";

export function applyOverrides(
  candidates: MatchCandidateResult[],
  overrides: OverrideInput[],
): MatchCandidateResult[] {
  const activeOverrides = overrides.filter((o) => o.active);
  const overrideMap = new Map<string, OverrideInput>();
  for (const override of activeOverrides) {
    overrideMap.set(override.providerId, override);
  }
  return candidates.map((candidate) => {
    const override = overrideMap.get(candidate.providerId);
    if (!override) return candidate;
    let eligibilityPassed = candidate.eligibilityPassed;
    let overallScore = candidate.overallScore;
    switch (override.type) {
      case "BOOST":
        overallScore = Math.min(100, overallScore + 15);
        break;
      case "SUPPRESS":
        overallScore = Math.max(0, overallScore - 20);
        break;
      case "EXCLUDE":
        eligibilityPassed = false;
        overallScore = 0;
        break;
    }
    return {
      ...candidate,
      eligibilityPassed,
      overallScore,
    };
  });
}
