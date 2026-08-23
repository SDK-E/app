export { executeMatchRun } from "./workflow.run";
export { applyMatchOverride } from "./workflow.overrides";
export { normalizeWeights, validateWeights, DEFAULT_WEIGHTS } from "./weights";
export {
  checkProviderStatus,
  checkCommercialReadiness,
  checkBudgetOverlap,
  checkAvailabilityWindow,
  checkTimezoneOverlap,
  checkLanguageOverlap,
  checkSkillOverlap,
  type EligibilityResult,
} from "@sdk-e/opportunities/eligibility-rules";
export { scoreCandidate } from "./scoring";
export { buildExplanation } from "./explanation";
export { applyOverrides } from "./overrides";
export type {
  MatchRunInput,
  ScoreDimension,
  ExplanationFragment,
  OverrideInput,
  CandidateScore,
  EffectiveWeights,
  MatchCandidateResult,
  MatchRunResult,
} from "./types";
