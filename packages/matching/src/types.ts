export interface CandidateScore {
  providerId: string;
  positionId?: string;
  overallScore: number;
  eligibilityPassed: boolean;
  scoreBreakdown: ScoreDimension[];
  explanation: ExplanationFragment[];
  warnings: string[];
}

export interface EffectiveWeights {
  skillMatch: number;
  seniority: number;
  rate: number;
  availability: number;
  location: number;
  language: number;
  completeness: number;
  serviceFit: number;
}

export interface ExplanationFragment {
  dimension: string;
  matchQuality: string;
  detail: string;
}

export interface MatchCandidateResult {
  providerId: string;
  positionId?: string;
  overallScore: number;
  eligibilityPassed: boolean;
  scoreBreakdown: ScoreDimension[];
  explanation: ExplanationFragment[];
  warnings: string[];
}

export interface MatchRunInput {
  companyId: string;
  opportunityId: string;
  triggeredById: string;
}

export interface MatchRunResult {
  matchRunId: string;
  totalCandidates: number;
  eligibleCandidates: number;
  warningsCount: number;
  candidates: MatchCandidateResult[];
}

export interface OverrideInput {
  companyId: string;
  opportunityId: string;
  providerId: string;
  type: "BOOST" | "EXCLUDE" | "SUPPRESS";
  reason: string;
  actorId: string;
  positionId?: string;
  active?: boolean;
}

export interface ScoreDimension {
  name: string;
  raw: number;
  weighted?: number;
  matchQuality: string;
}
