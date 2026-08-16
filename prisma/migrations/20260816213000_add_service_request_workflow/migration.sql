-- Extend the existing request lifecycle without renaming or removing states.
ALTER TYPE "request_status" ADD VALUE 'INFORMATION_REQUIRED';
ALTER TYPE "request_status" ADD VALUE 'PROPOSAL_READY';

CREATE TYPE "request_activity_type" AS ENUM (
  'CREATED',
  'UPDATED',
  'SUBMITTED',
  'REVIEW_STARTED',
  'INFORMATION_REQUESTED',
  'INFORMATION_PROVIDED',
  'PROPOSAL_READY',
  'ACCEPTED',
  'REJECTED',
  'CONVERTED_TO_PROJECT'
);

ALTER TABLE "request"
  ADD COLUMN "capability" VARCHAR(100) NOT NULL DEFAULT 'other',
  ADD COLUMN "businessContext" TEXT,
  ADD COLUMN "supportingInformation" TEXT,
  ADD COLUMN "supportingLinks" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE TABLE "request_activity" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "type" "request_activity_type" NOT NULL,
  "fromStatus" "request_status",
  "toStatus" "request_status",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "request_activity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "request_activity_companyId_createdAt_idx"
  ON "request_activity"("companyId", "createdAt");
CREATE INDEX "request_activity_requestId_createdAt_idx"
  ON "request_activity"("requestId", "createdAt");
CREATE INDEX "request_activity_actorId_idx" ON "request_activity"("actorId");

ALTER TABLE "request_activity"
  ADD CONSTRAINT "request_activity_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "request_activity"
  ADD CONSTRAINT "request_activity_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "request_activity"
  ADD CONSTRAINT "request_activity_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
