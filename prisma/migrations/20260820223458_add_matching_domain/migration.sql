-- CreateEnum
CREATE TYPE "match_run_status" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "match_candidate_selection_state" AS ENUM ('NOT_SELECTED', 'AUTO_SHORTLISTED', 'MANUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "match_override_type" AS ENUM ('BOOST', 'SUPPRESS', 'EXCLUDE');

-- CreateTable
CREATE TABLE "match_run" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "triggeredById" TEXT NOT NULL,
    "status" "match_run_status" NOT NULL DEFAULT 'PENDING',
    "configSnapshot" JSONB NOT NULL,
    "totalCandidates" INTEGER NOT NULL DEFAULT 0,
    "eligibleCandidates" INTEGER NOT NULL DEFAULT 0,
    "warningsCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_candidate" (
    "id" TEXT NOT NULL,
    "matchRunId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "positionId" TEXT,
    "overallScore" INTEGER NOT NULL,
    "eligibilityPassed" BOOLEAN NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "explanation" JSONB NOT NULL,
    "warnings" JSONB NOT NULL,
    "selectionState" "match_candidate_selection_state" NOT NULL DEFAULT 'NOT_SELECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_override" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "positionId" TEXT,
    "actorId" TEXT NOT NULL,
    "type" "match_override_type" NOT NULL,
    "reason" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_override_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_weight_config" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "positionId" TEXT,
    "skillMatchWeight" INTEGER NOT NULL DEFAULT 12,
    "seniorityWeight" INTEGER NOT NULL DEFAULT 12,
    "rateWeight" INTEGER NOT NULL DEFAULT 12,
    "availabilityWeight" INTEGER NOT NULL DEFAULT 12,
    "locationWeight" INTEGER NOT NULL DEFAULT 12,
    "languageWeight" INTEGER NOT NULL DEFAULT 12,
    "completenessWeight" INTEGER NOT NULL DEFAULT 12,
    "serviceFitWeight" INTEGER NOT NULL DEFAULT 12,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_weight_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_run_companyId_opportunityId_createdAt_idx" ON "match_run"("companyId", "opportunityId", "createdAt");

-- CreateIndex
CREATE INDEX "match_candidate_matchRunId_overallScore_idx" ON "match_candidate"("matchRunId", "overallScore");

-- CreateIndex
CREATE INDEX "match_candidate_opportunityId_providerId_idx" ON "match_candidate"("opportunityId", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "match_candidate_matchRunId_opportunityId_providerId_key" ON "match_candidate"("matchRunId", "opportunityId", "providerId");

-- CreateIndex
CREATE INDEX "match_override_opportunityId_providerId_createdAt_idx" ON "match_override"("opportunityId", "providerId", "createdAt");

-- CreateIndex
CREATE INDEX "match_weight_config_companyId_idx" ON "match_weight_config"("companyId");

-- CreateIndex
CREATE INDEX "match_weight_config_opportunityId_idx" ON "match_weight_config"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "match_weight_config_companyId_opportunityId_positionId_key" ON "match_weight_config"("companyId", "opportunityId", "positionId");

-- AddForeignKey
ALTER TABLE "match_run" ADD CONSTRAINT "match_run_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_run" ADD CONSTRAINT "match_run_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_run" ADD CONSTRAINT "match_run_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_candidate" ADD CONSTRAINT "match_candidate_matchRunId_fkey" FOREIGN KEY ("matchRunId") REFERENCES "match_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_candidate" ADD CONSTRAINT "match_candidate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_candidate" ADD CONSTRAINT "match_candidate_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_candidate" ADD CONSTRAINT "match_candidate_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_candidate" ADD CONSTRAINT "match_candidate_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "opportunity_position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_override" ADD CONSTRAINT "match_override_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_override" ADD CONSTRAINT "match_override_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_override" ADD CONSTRAINT "match_override_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_override" ADD CONSTRAINT "match_override_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "opportunity_position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_override" ADD CONSTRAINT "match_override_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_weight_config" ADD CONSTRAINT "match_weight_config_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_weight_config" ADD CONSTRAINT "match_weight_config_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_weight_config" ADD CONSTRAINT "match_weight_config_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "opportunity_position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
