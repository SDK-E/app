-- CreateEnum
CREATE TYPE "service_status" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "pricing_model" AS ENUM ('HOURLY', 'FIXED_PROJECT', 'RETAINER', 'DAY_RATE');

-- CreateEnum
CREATE TYPE "service_review_action" AS ENUM ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "service_media_asset_kind" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER');

-- CreateTable
CREATE TABLE "provider_service" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "service_status" NOT NULL DEFAULT 'DRAFT',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "capability" VARCHAR(100) NOT NULL DEFAULT 'other',
    "categoryTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pricingModel" "pricing_model",
    "rateMin" DECIMAL(10,2),
    "rateMax" DECIMAL(10,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "estimatedDuration" VARCHAR(100),
    "deliverables" TEXT,
    "completenessScore" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "unpublishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_service_review" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" "service_review_action" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_service_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_media_asset" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(1024) NOT NULL,
    "mimeType" VARCHAR(255) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "kind" "service_media_asset_kind" NOT NULL DEFAULT 'OTHER',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_media_asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_service_providerId_idx" ON "provider_service"("providerId");

-- CreateIndex
CREATE INDEX "provider_service_status_idx" ON "provider_service"("status");

-- CreateIndex
CREATE INDEX "provider_service_capability_idx" ON "provider_service"("capability");

-- CreateIndex
CREATE INDEX "provider_service_createdAt_idx" ON "provider_service"("createdAt");

-- CreateIndex
CREATE INDEX "provider_service_review_serviceId_idx" ON "provider_service_review"("serviceId");

-- CreateIndex
CREATE INDEX "provider_service_review_reviewerId_idx" ON "provider_service_review"("reviewerId");

-- CreateIndex
CREATE INDEX "provider_service_review_createdAt_idx" ON "provider_service_review"("createdAt");

-- CreateIndex
CREATE INDEX "service_media_asset_serviceId_idx" ON "service_media_asset"("serviceId");

-- CreateIndex
CREATE INDEX "service_media_asset_uploadedBy_idx" ON "service_media_asset"("uploadedBy");

-- CreateIndex
CREATE INDEX "service_media_asset_createdAt_idx" ON "service_media_asset"("createdAt");

-- AddForeignKey
ALTER TABLE "provider_service" ADD CONSTRAINT "provider_service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_service_review" ADD CONSTRAINT "provider_service_review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "provider_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_service_review" ADD CONSTRAINT "provider_service_review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_media_asset" ADD CONSTRAINT "service_media_asset_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "provider_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_media_asset" ADD CONSTRAINT "service_media_asset_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
