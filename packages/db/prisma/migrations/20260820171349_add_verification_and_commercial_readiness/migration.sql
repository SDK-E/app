-- CreateEnum
CREATE TYPE "verification_type" AS ENUM ('IDENTITY', 'BUSINESS_REGISTRATION', 'VAT_TAX', 'BANK_PAYOUT', 'PROFESSIONAL_CREDENTIAL');

-- CreateEnum
CREATE TYPE "verification_status" AS ENUM ('NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'VERIFIED', 'FAILED', 'EXPIRED', 'WAIVED');

-- CreateEnum
CREATE TYPE "verification_evidence_status" AS ENUM ('PENDING', 'UPLOADED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "commercial_status" AS ENUM ('NOT_READY', 'READY', 'SUSPENDED');

-- AlterTable
ALTER TABLE "provider" ADD COLUMN     "commercialStatus" "commercial_status" NOT NULL DEFAULT 'NOT_READY';

-- CreateTable
CREATE TABLE "verification_requirement" (
    "id" TEXT NOT NULL,
    "type" "verification_type" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_record" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "type" "verification_type" NOT NULL,
    "status" "verification_status" NOT NULL DEFAULT 'NOT_STARTED',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "rejectionReason" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_evidence" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(1024) NOT NULL,
    "mimeType" VARCHAR(255) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "contentHash" VARCHAR(255),
    "status" "verification_evidence_status" NOT NULL DEFAULT 'PENDING',
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_commercial_readiness" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "contractReady" BOOLEAN NOT NULL DEFAULT false,
    "payoutReady" BOOLEAN NOT NULL DEFAULT false,
    "taxInfoReady" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_commercial_readiness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verification_requirement_type_key" ON "verification_requirement"("type");

-- CreateIndex
CREATE INDEX "verification_record_providerId_idx" ON "verification_record"("providerId");

-- CreateIndex
CREATE INDEX "verification_record_type_idx" ON "verification_record"("type");

-- CreateIndex
CREATE INDEX "verification_record_status_idx" ON "verification_record"("status");

-- CreateIndex
CREATE INDEX "verification_record_createdAt_idx" ON "verification_record"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "verification_record_providerId_type_key" ON "verification_record"("providerId", "type");

-- CreateIndex
CREATE INDEX "verification_evidence_verificationId_idx" ON "verification_evidence"("verificationId");

-- CreateIndex
CREATE INDEX "verification_evidence_uploadedBy_idx" ON "verification_evidence"("uploadedBy");

-- CreateIndex
CREATE INDEX "verification_evidence_createdAt_idx" ON "verification_evidence"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "provider_commercial_readiness_providerId_key" ON "provider_commercial_readiness"("providerId");

-- CreateIndex
CREATE INDEX "provider_commercial_readiness_providerId_idx" ON "provider_commercial_readiness"("providerId");

-- CreateIndex
CREATE INDEX "provider_commercialStatus_idx" ON "provider"("commercialStatus");

-- AddForeignKey
ALTER TABLE "verification_record" ADD CONSTRAINT "verification_record_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_record" ADD CONSTRAINT "verification_record_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_evidence" ADD CONSTRAINT "verification_evidence_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "verification_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_evidence" ADD CONSTRAINT "verification_evidence_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_commercial_readiness" ADD CONSTRAINT "provider_commercial_readiness_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
