/*
  Warnings:

  - Added the required column `companyId` to the `provider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "provider" ADD COLUMN     "companyId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "provider_companyId_idx" ON "provider"("companyId");

-- AddForeignKey
ALTER TABLE "provider" ADD CONSTRAINT "provider_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
