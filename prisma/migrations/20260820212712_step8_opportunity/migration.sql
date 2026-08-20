-- CreateEnum
CREATE TYPE "opportunity_activity_type" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED', 'VISIBILITY_CHANGED', 'POSITION_ADDED', 'POSITION_UPDATED', 'POSITION_REMOVED', 'NOTE_ADDED', 'FILLED', 'CLOSED', 'CANCELLED', 'REACTIVATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "opportunity_status" ADD VALUE 'MATCHING';
ALTER TYPE "opportunity_status" ADD VALUE 'REVIEWING_PROPOSALS';
ALTER TYPE "opportunity_status" ADD VALUE 'SHORTLISTING';
ALTER TYPE "opportunity_status" ADD VALUE 'SELECTION';
ALTER TYPE "opportunity_status" ADD VALUE 'PENDING_PROVIDER_ACCEPTANCE';
ALTER TYPE "opportunity_status" ADD VALUE 'ON_HOLD';
ALTER TYPE "opportunity_status" ADD VALUE 'EXPIRED';

-- DropIndex
DROP INDEX "opportunity_companyId_idx";

-- AlterTable
ALTER TABLE "document" ADD COLUMN     "opportunityId" TEXT,
ADD COLUMN     "opportunityPositionId" TEXT;

-- AlterTable
ALTER TABLE "opportunity" ADD COLUMN     "budgetMax" DECIMAL(10,2),
ADD COLUMN     "budgetMin" DECIMAL(10,2),
ADD COLUMN     "clientIdentityVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clientName" VARCHAR(255),
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "deliverables" TEXT,
ADD COLUMN     "duration" VARCHAR(100),
ADD COLUMN     "engagementType" VARCHAR(100),
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "locationTimezone" VARCHAR(100),
ADD COLUMN     "ndaRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "preferredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "providerCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "rejectionFeedback" TEXT,
ADD COLUMN     "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seniority" VARCHAR(100),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "opportunity_position" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seniority" VARCHAR(100),
    "engagementType" VARCHAR(100),
    "budgetMin" DECIMAL(10,2),
    "budgetMax" DECIMAL(10,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "duration" VARCHAR(100),
    "startDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "locationTimezone" VARCHAR(100),
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "deliverables" TEXT,
    "providerCount" INTEGER NOT NULL DEFAULT 1,
    "internalNotes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_activity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "type" "opportunity_activity_type" NOT NULL,
    "fromStatus" "opportunity_status",
    "toStatus" "opportunity_status",
    "fromVisibility" "opportunity_visibility_mode",
    "toVisibility" "opportunity_visibility_mode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunity_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opportunity_position_opportunityId_idx" ON "opportunity_position"("opportunityId");

-- CreateIndex
CREATE INDEX "opportunity_position_companyId_idx" ON "opportunity_position"("companyId");

-- CreateIndex
CREATE INDEX "opportunity_position_createdAt_idx" ON "opportunity_position"("createdAt");

-- CreateIndex
CREATE INDEX "opportunity_activity_opportunityId_createdAt_idx" ON "opportunity_activity"("opportunityId", "createdAt");

-- CreateIndex
CREATE INDEX "opportunity_activity_companyId_createdAt_idx" ON "opportunity_activity"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "opportunity_activity_actorId_idx" ON "opportunity_activity"("actorId");

-- CreateIndex
CREATE INDEX "document_opportunityId_idx" ON "document"("opportunityId");

-- CreateIndex
CREATE INDEX "document_opportunityPositionId_idx" ON "document"("opportunityPositionId");

-- CreateIndex
CREATE INDEX "opportunity_companyId_status_idx" ON "opportunity"("companyId", "status");

-- CreateIndex
CREATE INDEX "opportunity_companyId_visibilityMode_idx" ON "opportunity"("companyId", "visibilityMode");

-- CreateIndex
CREATE INDEX "opportunity_ownerId_idx" ON "opportunity"("ownerId");

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_position" ADD CONSTRAINT "opportunity_position_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_position" ADD CONSTRAINT "opportunity_position_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_activity" ADD CONSTRAINT "opportunity_activity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_activity" ADD CONSTRAINT "opportunity_activity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_activity" ADD CONSTRAINT "opportunity_activity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_opportunityPositionId_fkey" FOREIGN KEY ("opportunityPositionId") REFERENCES "opportunity_position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
