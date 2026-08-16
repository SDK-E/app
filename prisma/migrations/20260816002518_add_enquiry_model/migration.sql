/*
  Warnings:

  - You are about to alter the column `name` on the `company` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `slug` on the `company` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `name` on the `document` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `storageKey` on the `document` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1024)`.
  - You are about to alter the column `mimeType` on the `document` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `currency` on the `invoice` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(3)`.
  - You are about to alter the column `name` on the `milestone` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `project` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `title` on the `request` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `avatarUrl` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1024)`.

*/
-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_requestId_fkey";

-- AlterTable
ALTER TABLE "company" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "document" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "storageKey" SET DATA TYPE VARCHAR(1024),
ALTER COLUMN "mimeType" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "invoice" ALTER COLUMN "currency" SET DATA TYPE VARCHAR(3);

-- AlterTable
ALTER TABLE "milestone" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "project" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "request" ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "avatarUrl" SET DATA TYPE VARCHAR(1024);

-- CreateTable
CREATE TABLE "enquiry" (
    "id" TEXT NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "website" VARCHAR(1024),
    "capability" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "environment" TEXT,
    "timeline" VARCHAR(255),
    "budgetRange" VARCHAR(255),
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enquiry_email_idx" ON "enquiry"("email");

-- CreateIndex
CREATE INDEX "enquiry_createdAt_idx" ON "enquiry"("createdAt");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "request"("id") ON DELETE SET NULL ON UPDATE CASCADE;
