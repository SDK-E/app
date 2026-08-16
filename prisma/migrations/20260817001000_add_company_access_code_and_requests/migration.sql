-- CreateEnum
CREATE TYPE "company_access_request_status" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED');

-- AlterTable
ALTER TABLE "company" ADD COLUMN     "accessCode" VARCHAR(16);

-- Backfill: generate an 8-character XXXX-XXXX access code for every existing company.
UPDATE "company"
SET "accessCode" = upper(substr(md5(id || ':' || random()::text), 1, 4)) || '-' || upper(substr(md5(id || ':' || clock_timestamp()::text), 1, 4))
WHERE "accessCode" IS NULL;

-- CreateTable
CREATE TABLE "company_access_request" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "requestedRole" "client_role" NOT NULL DEFAULT 'VIEWER',
    "status" "company_access_request_status" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_access_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_access_request_companyId_status_idx" ON "company_access_request"("companyId", "status");

-- CreateIndex
CREATE INDEX "company_access_request_userId_status_idx" ON "company_access_request"("userId", "status");

-- CreateIndex
CREATE INDEX "company_access_request_companyId_createdAt_idx" ON "company_access_request"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "company_accessCode_key" ON "company"("accessCode");

-- AddForeignKey
ALTER TABLE "company_access_request" ADD CONSTRAINT "company_access_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_access_request" ADD CONSTRAINT "company_access_request_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_access_request" ADD CONSTRAINT "company_access_request_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
