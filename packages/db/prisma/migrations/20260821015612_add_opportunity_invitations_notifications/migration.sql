-- CreateEnum
CREATE TYPE "notification_category" AS ENUM ('OPPORTUNITY', 'INVITATION', 'PROPOSAL', 'INTERVIEW', 'OFFER', 'ENGAGEMENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('OPPORTUNITY_INVITATION_SENT', 'OPPORTUNITY_INVITATION_ACCEPTED', 'OPPORTUNITY_INVITATION_DECLINED', 'OPPORTUNITY_INVITATION_EXPIRED', 'OPPORTUNITY_SAVED', 'OPPORTUNITY_RECOMMENDED');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('IN_APP', 'EMAIL');

-- CreateEnum
CREATE TYPE "opportunity_invitation_status" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "opportunity_provider_action" AS ENUM ('SAVED', 'HIDDEN');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientKind" VARCHAR(32) NOT NULL,
    "category" "notification_category" NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "eventKey" VARCHAR(255) NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_delivery" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" "notification_channel" NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_invitation" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "opportunity_invitation_status" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_provider_preference" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "action" "opportunity_provider_action" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_provider_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_recipientId_createdAt_idx" ON "notification"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "notification_category_type_idx" ON "notification"("category", "type");

-- CreateIndex
CREATE UNIQUE INDEX "notification_recipientId_eventKey_key" ON "notification"("recipientId", "eventKey");

-- CreateIndex
CREATE INDEX "notification_delivery_notificationId_idx" ON "notification_delivery"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_delivery_notificationId_channel_key" ON "notification_delivery"("notificationId", "channel");

-- CreateIndex
CREATE INDEX "opportunity_invitation_opportunityId_providerId_idx" ON "opportunity_invitation"("opportunityId", "providerId");

-- CreateIndex
CREATE INDEX "opportunity_invitation_providerId_status_idx" ON "opportunity_invitation"("providerId", "status");

-- CreateIndex
CREATE INDEX "opportunity_invitation_companyId_idx" ON "opportunity_invitation"("companyId");

-- CreateIndex
CREATE INDEX "opportunity_invitation_expiresAt_idx" ON "opportunity_invitation"("expiresAt");

-- CreateIndex
CREATE INDEX "opportunity_provider_preference_providerId_idx" ON "opportunity_provider_preference"("providerId");

-- CreateIndex
CREATE INDEX "opportunity_provider_preference_companyId_idx" ON "opportunity_provider_preference"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_provider_preference_opportunityId_providerId_key" ON "opportunity_provider_preference"("opportunityId", "providerId");

-- AddForeignKey
ALTER TABLE "notification_delivery" ADD CONSTRAINT "notification_delivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_invitation" ADD CONSTRAINT "opportunity_invitation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_invitation" ADD CONSTRAINT "opportunity_invitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_invitation" ADD CONSTRAINT "opportunity_invitation_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_invitation" ADD CONSTRAINT "opportunity_invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_provider_preference" ADD CONSTRAINT "opportunity_provider_preference_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_provider_preference" ADD CONSTRAINT "opportunity_provider_preference_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_provider_preference" ADD CONSTRAINT "opportunity_provider_preference_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
