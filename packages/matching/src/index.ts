export { buildExplanation } from "./explanation";
export { applyOverrides } from "./overrides";
export { scoreCandidate } from "./scoring";
export type {
  CandidateScore,
  EffectiveWeights,
  ExplanationFragment,
  MatchCandidateResult,
  MatchRunInput,
  MatchRunResult,
  OverrideInput,
  ScoreDimension,
} from "./types";
export { DEFAULT_WEIGHTS, normalizeWeights, validateWeights } from "./weights";
export { applyMatchOverride } from "./workflow.overrides";
export { executeMatchRun } from "./workflow.run";
export {
  checkAvailabilityWindow,
  checkBudgetOverlap,
  checkCommercialReadiness,
  checkLanguageOverlap,
  checkProviderStatus,
  checkSkillOverlap,
  checkTimezoneOverlap,
  type EligibilityResult,
} from "@platform/opportunities/eligibility-rules";
