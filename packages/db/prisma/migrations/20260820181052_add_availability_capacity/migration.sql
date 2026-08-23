-- CreateEnum
CREATE TYPE "absence_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "reservation_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "provider" ADD COLUMN     "defaultDailyHours" DECIMAL(4,1);

-- CreateTable
CREATE TABLE "provider_weekly_capacity" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "hoursPerDay" DECIMAL(4,1) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_weekly_capacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_absence" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" TEXT,
    "status" "absence_status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_absence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacity_reservation" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "engagementId" TEXT,
    "hoursPerDay" DECIMAL(4,1) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "reservation_status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capacity_reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_weekly_capacity_providerId_idx" ON "provider_weekly_capacity"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_weekly_capacity_providerId_weekday_key" ON "provider_weekly_capacity"("providerId", "weekday");

-- CreateIndex
CREATE INDEX "provider_absence_providerId_startDate_endDate_idx" ON "provider_absence"("providerId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "provider_absence_status_idx" ON "provider_absence"("status");

-- CreateIndex
CREATE INDEX "capacity_reservation_providerId_startDate_endDate_idx" ON "capacity_reservation"("providerId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "capacity_reservation_status_idx" ON "capacity_reservation"("status");

-- CreateIndex
CREATE INDEX "capacity_reservation_engagementId_idx" ON "capacity_reservation"("engagementId");

-- AddForeignKey
ALTER TABLE "provider_weekly_capacity" ADD CONSTRAINT "provider_weekly_capacity_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_absence" ADD CONSTRAINT "provider_absence_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacity_reservation" ADD CONSTRAINT "capacity_reservation_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
