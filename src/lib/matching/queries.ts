import { getPrisma } from "@/lib/db";
import type { MatchRunInput, OverrideInput } from "./types";
import type { MatchRunStatus } from "@/generated/prisma/client";

export async function createMatchRun(input: MatchRunInput) {
  return getPrisma().matchRun.create({
    data: {
      companyId: input.companyId,
      opportunityId: input.opportunityId,
      triggeredById: input.triggeredById,
      status: "PENDING",
      configSnapshot: {},
    },
  });
}

export async function updateMatchRun(
  id: string,
  data: {
    status?: MatchRunStatus;
    startedAt?: Date;
    completedAt?: Date;
    totalCandidates?: number;
    eligibleCandidates?: number;
    warningsCount?: number;
    errorMessage?: string;
  }
) {
  return getPrisma().matchRun.update({
    where: { id },
    data,
  });
}

export async function createMatchCandidate(data: {
  matchRunId: string;
  companyId: string;
  opportunityId: string;
  providerId: string;
  positionId?: string;
  overallScore: number;
  eligibilityPassed: boolean;
  scoreBreakdown: unknown;
  explanation: unknown[];
  warnings: string[];
}) {
  return getPrisma().matchCandidate.create({
    data: {
      matchRunId: data.matchRunId,
      companyId: data.companyId,
      opportunityId: data.opportunityId,
      providerId: data.providerId,
      positionId: data.positionId,
      overallScore: data.overallScore,
      eligibilityPassed: data.eligibilityPassed,
      scoreBreakdown: data.scoreBreakdown as never,
      explanation: data.explanation as never,
      warnings: data.warnings,
    },
  });
}

export async function createOverride(input: OverrideInput) {
  return getPrisma().matchOverride.create({
    data: {
      companyId: input.companyId,
      opportunityId: input.opportunityId,
      providerId: input.providerId,
      actorId: input.actorId,
      type: input.type,
      reason: input.reason,
      active: true,
      positionId: input.positionId,
    },
  });
}

export async function listOverrides(companyId: string, opportunityId: string) {
  return getPrisma().matchOverride.findMany({
    where: { companyId, opportunityId, active: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMatchRuns(companyId: string, opportunityId: string) {
  return getPrisma().matchRun.findMany({
    where: { companyId, opportunityId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMatchCandidates(matchRunId: string) {
  return getPrisma().matchCandidate.findMany({
    where: { matchRunId },
    orderBy: { overallScore: "desc" },
  });
}

export async function getWeightConfig(
  companyId: string,
  opportunityId?: string,
  positionId?: string
) {
  return getPrisma().matchWeightConfig.findFirst({
    where: {
      companyId,
      opportunityId: opportunityId ?? null,
      positionId: positionId ?? null,
      active: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deactivatePreviousOverrides(
  companyId: string,
  opportunityId: string,
  providerId: string
) {
  return getPrisma().matchOverride.updateMany({
    where: {
      companyId,
      opportunityId,
      providerId,
      active: true,
    },
    data: { active: false },
  });
}
