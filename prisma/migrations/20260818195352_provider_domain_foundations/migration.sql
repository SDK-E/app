-- CreateEnum
CREATE TYPE "provider_status" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "audit_actor_kind" AS ENUM ('USER', 'PROVIDER', 'SDK_STAFF', 'SYSTEM');

-- CreateTable
CREATE TABLE "provider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "provider_status" NOT NULL DEFAULT 'DRAFT',
    "businessName" VARCHAR(255),
    "timeZone" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "actorId" TEXT,
    "actorKind" "audit_actor_kind" NOT NULL DEFAULT 'USER',
    "action" VARCHAR(100) NOT NULL,
    "targetType" VARCHAR(100) NOT NULL,
    "targetId" VARCHAR(100) NOT NULL,
    "fromState" VARCHAR(100),
    "toState" VARCHAR(100),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_userId_key" ON "provider"("userId");

-- CreateIndex
CREATE INDEX "provider_userId_idx" ON "provider"("userId");

-- CreateIndex
CREATE INDEX "provider_status_idx" ON "provider"("status");

-- CreateIndex
CREATE INDEX "provider_createdAt_idx" ON "provider"("createdAt");

-- CreateIndex
CREATE INDEX "audit_event_actorId_idx" ON "audit_event"("actorId");

-- CreateIndex
CREATE INDEX "audit_event_targetType_targetId_idx" ON "audit_event"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "audit_event_companyId_idx" ON "audit_event"("companyId");

-- CreateIndex
CREATE INDEX "audit_event_createdAt_idx" ON "audit_event"("createdAt");

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
