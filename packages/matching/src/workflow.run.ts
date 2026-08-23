import { getPrisma } from "@sdk-e/db";
import { createAuditEvent } from "@sdk-e/core/audit";
import { opportunityMachine } from "@sdk-e/opportunities/machine";
import { requireSdkStaff } from "@sdk-e/auth/authorization";
import { requireActiveCompany } from "@sdk-e/requests/guards";
import { normalizeWeights } from "./weights";
import { createMatchRun, updateMatchRun, createMatchCandidate, listOverrides } from "./queries";
import { applyOverrides } from "./overrides";
import { scoreProvider } from "./workflow.scoring";
import type { AppPrincipal } from "@sdk-e/types";
import type { CandidateScore, MatchRunResult } from "./types";

export async function executeMatchRun(
  principal: AppPrincipal,
  companyId: string,
  opportunityId: string
): Promise<MatchRunResult> {
  const staff = requireSdkStaff(principal, ["ADMIN", "DELIVERY"]);
  await requireActiveCompany(staff, companyId);

  return getPrisma().$transaction(async (tx) => {
    const opportunity = await tx.opportunity.findFirst({ where: { id: opportunityId, companyId } });
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }

    opportunityMachine.assertTransition(opportunity.status, "MATCHING");
    await tx.opportunity.update({
      where: { id: opportunityId },
      data: { status: "MATCHING" },
    });

    const matchRun = await createMatchRun({
      companyId,
      opportunityId,
      triggeredById: staff.id,
    });

    const matchRunId = matchRun.id;
    await updateMatchRun(matchRunId, { status: "RUNNING", startedAt: new Date() });

    const providers = await tx.provider.findMany({
      where: { companyId, status: "ACTIVE", commercialStatus: "READY" },
      include: {
        weeklyCapacity: true,
        absences: true,
        services: true,
      },
    });

    const weightConfig = await tx.matchWeightConfig.findFirst({
      where: { companyId, opportunityId, active: true },
      orderBy: { createdAt: "desc" },
    });
    const weights = weightConfig
      ? normalizeWeights({
          skillMatch: weightConfig.skillMatchWeight,
          seniority: weightConfig.seniorityWeight,
          rate: weightConfig.rateWeight,
          availability: weightConfig.availabilityWeight,
          location: weightConfig.locationWeight,
          language: weightConfig.languageWeight,
          completeness: weightConfig.completenessWeight,
          serviceFit: weightConfig.serviceFitWeight,
        })
      : normalizeWeights({});

    const candidates: CandidateScore[] = [];
    let totalCandidates = 0;
    let eligibleCandidates = 0;
    let warningsCount = 0;

    for (const provider of providers) {
      totalCandidates++;
      const result = scoreProvider(provider, opportunity, weights);
      candidates.push(result);
      warningsCount += result.eligibilityWarnings.length;
      if (result.eligibilityPassed) eligibleCandidates++;
    }

    const activeOverrides = await listOverrides(companyId, opportunityId);
    const overrideInputs = activeOverrides.map((o) => ({
      companyId: o.companyId,
      opportunityId: o.opportunityId,
      providerId: o.providerId,
      type: o.type,
      reason: o.reason,
      actorId: o.actorId,
      positionId: o.positionId ?? undefined,
    }));

    const scoredCandidates = applyOverrides(candidates, overrideInputs);

    for (const candidate of scoredCandidates) {
      await createMatchCandidate({
        matchRunId,
        companyId,
        opportunityId,
        providerId: candidate.providerId,
        overallScore: candidate.overallScore,
        eligibilityPassed: candidate.eligibilityPassed,
        scoreBreakdown: candidate.scoreBreakdown as unknown as Record<string, unknown>,
        explanation: candidate.explanation as unknown as Record<string, unknown>[],
        warnings: candidate.warnings,
      });
    }

    await updateMatchRun(matchRunId, {
      status: "COMPLETED",
      completedAt: new Date(),
      totalCandidates,
      eligibleCandidates,
      warningsCount,
    });

    await createAuditEvent({
      companyId,
      actorId: staff.id,
      actorKind: "SDK_STAFF",
      action: "match.run.completed",
      targetType: "MatchRun",
      targetId: matchRunId,
      metadata: {
        candidateCount: totalCandidates,
        eligibleCount: eligibleCandidates,
        overrideCount: activeOverrides.length,
      },
    });

    return {
      matchRunId,
      totalCandidates,
      eligibleCandidates,
      warningsCount,
      candidates: scoredCandidates,
    };
  });
}
