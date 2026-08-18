-- CreateEnum
CREATE TYPE "provider_review_action" AS ENUM ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- AlterTable
ALTER TABLE "provider" ADD COLUMN     "biography" TEXT,
ADD COLUMN     "businessLegalInfo" TEXT,
ADD COLUMN     "completenessScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cvStorageKey" VARCHAR(1024),
ADD COLUMN     "expectedRateMax" DECIMAL(10,2),
ADD COLUMN     "expectedRateMin" DECIMAL(10,2),
ADD COLUMN     "githubUrl" VARCHAR(1024),
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "linkedinUrl" VARCHAR(1024),
ADD COLUMN     "portfolioUrl" VARCHAR(1024),
ADD COLUMN     "preferredProjectTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "professionalTitle" VARCHAR(255),
ADD COLUMN     "vatInfo" VARCHAR(255),
ADD COLUMN     "websiteUrl" VARCHAR(1024),
ADD COLUMN     "yearsOfExperience" INTEGER;

-- CreateTable
CREATE TABLE "provider_review" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" "provider_review_action" NOT NULL,
    "reason" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_review_providerId_idx" ON "provider_review"("providerId");

-- CreateIndex
CREATE INDEX "provider_review_reviewerId_idx" ON "provider_review"("reviewerId");

-- CreateIndex
CREATE INDEX "provider_review_createdAt_idx" ON "provider_review"("createdAt");

-- AddForeignKey
ALTER TABLE "provider_review" ADD CONSTRAINT "provider_review_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_review" ADD CONSTRAINT "provider_review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
