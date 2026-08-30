/*
  Warnings:

  - Added the required column `updatedAt` to the `service_media_asset` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "opportunity_status" AS ENUM ('DRAFT', 'READY', 'OPEN', 'FILLED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "opportunity_visibility_mode" AS ENUM ('DIRECT', 'INVITE_ONLY', 'ELIGIBLE_NETWORK');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "request_activity_type" ADD VALUE 'OWNER_ASSIGNED';
ALTER TYPE "request_activity_type" ADD VALUE 'CONVERTED_TO_OPPORTUNITY';

-- AlterTable
ALTER TABLE "request" ADD COLUMN     "budgetContext" TEXT,
ADD COLUMN     "confidentialityLevel" VARCHAR(100),
ADD COLUMN     "desiredOutcomes" TEXT,
ADD COLUMN     "duration" VARCHAR(100),
ADD COLUMN     "expectedWorkload" VARCHAR(100),
ADD COLUMN     "language" VARCHAR(100),
ADD COLUMN     "locationTimezone" VARCHAR(100),
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "preferredEngagementModel" VARCHAR(100),
ADD COLUMN     "preferredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seniority" VARCHAR(100),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "service_media_asset" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "opportunity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requestId" TEXT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "opportunity_status" NOT NULL DEFAULT 'DRAFT',
    "visibilityMode" "opportunity_visibility_mode" NOT NULL DEFAULT 'INVITE_ONLY',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_requestId_key" ON "opportunity"("requestId");

-- CreateIndex
CREATE INDEX "opportunity_companyId_idx" ON "opportunity"("companyId");

-- CreateIndex
CREATE INDEX "opportunity_requestId_idx" ON "opportunity"("requestId");

-- CreateIndex
CREATE INDEX "opportunity_status_idx" ON "opportunity"("status");

-- CreateIndex
CREATE INDEX "opportunity_createdBy_idx" ON "opportunity"("createdBy");

-- CreateIndex
CREATE INDEX "opportunity_createdAt_idx" ON "opportunity"("createdAt");

-- CreateIndex
CREATE INDEX "request_ownerId_idx" ON "request"("ownerId");

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
