Loaded Prisma config from prisma.config.ts.

-- CreateEnum
CREATE TYPE "service_provider_status" AS ENUM ('APPLICANT', 'ONBOARDING', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "provider_assignment_status" AS ENUM ('INVITED', 'ACTIVE', 'PAUSED', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "provider_compensation_type" AS ENUM ('HOURLY', 'DAILY', 'FIXED_FEE');

-- CreateEnum
CREATE TYPE "compliance_requirement_status" AS ENUM ('MISSING', 'SUBMITTED', 'CHANGES_REQUIRED', 'VERIFIED', 'REJECTED', 'EXPIRED', 'WAIVED');

-- CreateEnum
CREATE TYPE "provider_document_status" AS ENUM ('UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "time_entry_status" AS ENUM ('DRAFT', 'SUBMITTED', 'CLIENT_REVIEW', 'SDK_REVIEW', 'CHANGES_REQUIRED', 'APPROVED', 'REJECTED', 'INVOICED');

-- CreateEnum
CREATE TYPE "provider_invoice_status" AS ENUM ('DRAFT', 'SUBMITTED', 'CHANGES_REQUIRED', 'APPROVED', 'REJECTED', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "provider_invoice_line_type" AS ENUM ('TIME', 'FIXED_FEE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "form_template_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "form_response_status" AS ENUM ('DRAFT', 'SUBMITTED', 'CHANGES_REQUIRED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "automation_event_type" AS ENUM ('PROVIDER_CHANGED', 'DOCUMENT_SUBMITTED', 'DOCUMENT_REVIEWED', 'FORM_SUBMITTED', 'FORM_REVIEWED', 'TIME_SUBMITTED', 'TIME_REVIEWED', 'INVOICE_SUBMITTED', 'INVOICE_REVIEWED', 'DUE_SOON', 'OVERDUE');

-- CreateEnum
CREATE TYPE "automation_delivery_status" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'RETRYING', 'FAILED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "invitation_kind" ADD VALUE 'SERVICE_PROVIDER';

-- AlterTable
ALTER TABLE "invitation" ADD COLUMN     "providerApplicationId" TEXT;

-- CreateTable
CREATE TABLE "provider_application" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "countryCode" CHAR(2) NOT NULL,
    "professionalHeadline" VARCHAR(255) NOT NULL,
    "profileSummary" TEXT NOT NULL,
    "portfolioUrl" VARCHAR(1024),
    "privacyAcceptedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "invitedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_provider_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "service_provider_status" NOT NULL DEFAULT 'ONBOARDING',
    "legalName" VARCHAR(255),
    "tradingName" VARCHAR(255),
    "professionalHeadline" VARCHAR(255),
    "professionalEmail" VARCHAR(255),
    "professionalPhone" VARCHAR(50),
    "addressLine1" VARCHAR(255),
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(120),
    "postalCode" VARCHAR(32),
    "countryCode" CHAR(2),
    "taxResidenceCode" CHAR(2),
    "registrationIdEncrypted" TEXT,
    "taxIdEncrypted" TEXT,
    "vatIdEncrypted" TEXT,
    "payoutDetailsEncrypted" TEXT,
    "declarations" JSONB,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_provider_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checklist_template" (
    "id" TEXT NOT NULL,
    "countryCode" CHAR(2) NOT NULL,
    "classification" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "version" INTEGER NOT NULL,
    "requirements" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_checklist_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_requirement" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "requirementKey" VARCHAR(120) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "status" "compliance_requirement_status" NOT NULL DEFAULT 'MISSING',
    "evidence" JSONB,
    "validFrom" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "waivedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_document" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "requirementId" TEXT,
    "documentType" VARCHAR(120) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "originalName" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(1024) NOT NULL,
    "mimeType" VARCHAR(255) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" VARCHAR(128),
    "status" "provider_document_status" NOT NULL DEFAULT 'UPLOADED',
    "expiresAt" TIMESTAMP(3),
    "retentionUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_assignment" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "provider_assignment_status" NOT NULL DEFAULT 'INVITED',
    "roleTitle" VARCHAR(255) NOT NULL,
    "startsOn" TIMESTAMP(3),
    "endsOn" TIMESTAMP(3),
    "clientTimeApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
    "contactVisibleToClient" BOOLEAN NOT NULL DEFAULT true,
    "compensationType" "provider_compensation_type" NOT NULL,
    "rateAmount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "unitsPerDay" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entry" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "milestoneId" TEXT,
    "workDate" DATE NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" "time_entry_status" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "clientReviewedAt" TIMESTAMP(3),
    "sdkReviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "replacesTimeEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_invoice" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "supplierInvoiceNumber" VARCHAR(100) NOT NULL,
    "status" "provider_invoice_status" NOT NULL DEFAULT 'DRAFT',
    "issueDate" DATE NOT NULL,
    "dueDate" DATE,
    "currency" VARCHAR(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "providerLegalSnapshot" JSONB NOT NULL,
    "sdkBillingEntitySnapshot" JSONB NOT NULL,
    "originalDocumentId" TEXT,
    "reviewerNotes" TEXT,
    "reviewedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paymentReference" VARCHAR(255),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_invoice_line" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "timeEntryId" TEXT,
    "milestoneId" TEXT,
    "type" "provider_invoice_line_type" NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitAmount" DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "adjustmentReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_invoice_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_form_template" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "form_template_status" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_form_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_form_version" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "schema" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_form_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_form_response" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "status" "form_response_status" NOT NULL DEFAULT 'DRAFT',
    "values" JSONB NOT NULL,
    "clientVisible" BOOLEAN NOT NULL DEFAULT false,
    "assignedReviewer" TEXT,
    "dueAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_form_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rule" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "version" INTEGER NOT NULL,
    "eventType" "automation_event_type" NOT NULL,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "webhookUrl" VARCHAR(2048),
    "webhookSecretEncrypted" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_delivery" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "idempotencyKey" VARCHAR(255) NOT NULL,
    "status" "automation_delivery_status" NOT NULL DEFAULT 'PENDING',
    "eventPayload" JSONB NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "lastError" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_attempt" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "responseCode" INTEGER,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "automation_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_audit_event" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "providerId" TEXT,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(255) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "href" VARCHAR(1024),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_application_email_createdAt_idx" ON "provider_application"("email", "createdAt");

-- CreateIndex
CREATE INDEX "provider_application_countryCode_idx" ON "provider_application"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "service_provider_profile_userId_key" ON "service_provider_profile"("userId");

-- CreateIndex
CREATE INDEX "service_provider_profile_status_idx" ON "service_provider_profile"("status");

-- CreateIndex
CREATE INDEX "service_provider_profile_countryCode_idx" ON "service_provider_profile"("countryCode");

-- CreateIndex
CREATE INDEX "compliance_checklist_template_countryCode_isPublished_idx" ON "compliance_checklist_template"("countryCode", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_checklist_template_countryCode_classification_ve_key" ON "compliance_checklist_template"("countryCode", "classification", "version");

-- CreateIndex
CREATE INDEX "compliance_requirement_providerId_status_idx" ON "compliance_requirement"("providerId", "status");

-- CreateIndex
CREATE INDEX "compliance_requirement_expiresAt_idx" ON "compliance_requirement"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_requirement_providerId_requirementKey_key" ON "compliance_requirement"("providerId", "requirementKey");

-- CreateIndex
CREATE UNIQUE INDEX "provider_document_storageKey_key" ON "provider_document"("storageKey");

-- CreateIndex
CREATE INDEX "provider_document_providerId_status_idx" ON "provider_document"("providerId", "status");

-- CreateIndex
CREATE INDEX "provider_document_requirementId_idx" ON "provider_document"("requirementId");

-- CreateIndex
CREATE INDEX "provider_document_expiresAt_idx" ON "provider_document"("expiresAt");

-- CreateIndex
CREATE INDEX "provider_assignment_companyId_projectId_idx" ON "provider_assignment"("companyId", "projectId");

-- CreateIndex
CREATE INDEX "provider_assignment_providerId_status_idx" ON "provider_assignment"("providerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "provider_assignment_providerId_projectId_key" ON "provider_assignment"("providerId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "time_entry_replacesTimeEntryId_key" ON "time_entry"("replacesTimeEntryId");

-- CreateIndex
CREATE INDEX "time_entry_assignmentId_workDate_idx" ON "time_entry"("assignmentId", "workDate");

-- CreateIndex
CREATE INDEX "time_entry_status_idx" ON "time_entry"("status");

-- CreateIndex
CREATE INDEX "provider_invoice_providerId_status_idx" ON "provider_invoice"("providerId", "status");

-- CreateIndex
CREATE INDEX "provider_invoice_assignmentId_idx" ON "provider_invoice"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_invoice_providerId_supplierInvoiceNumber_key" ON "provider_invoice"("providerId", "supplierInvoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "provider_invoice_line_timeEntryId_key" ON "provider_invoice_line"("timeEntryId");

-- CreateIndex
CREATE INDEX "provider_invoice_line_invoiceId_idx" ON "provider_invoice_line"("invoiceId");

-- CreateIndex
CREATE INDEX "provider_form_template_projectId_status_idx" ON "provider_form_template"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "provider_form_version_templateId_version_key" ON "provider_form_version"("templateId", "version");

-- CreateIndex
CREATE INDEX "provider_form_response_assignmentId_status_idx" ON "provider_form_response"("assignmentId", "status");

-- CreateIndex
CREATE INDEX "provider_form_response_providerId_idx" ON "provider_form_response"("providerId");

-- CreateIndex
CREATE INDEX "provider_form_response_dueAt_idx" ON "provider_form_response"("dueAt");

-- CreateIndex
CREATE INDEX "automation_rule_eventType_isEnabled_idx" ON "automation_rule"("eventType", "isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "automation_rule_name_version_key" ON "automation_rule"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "automation_delivery_idempotencyKey_key" ON "automation_delivery"("idempotencyKey");

-- CreateIndex
CREATE INDEX "automation_delivery_status_nextAttemptAt_idx" ON "automation_delivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "automation_attempt_deliveryId_attempt_key" ON "automation_attempt"("deliveryId", "attempt");

-- CreateIndex
CREATE INDEX "provider_audit_event_providerId_createdAt_idx" ON "provider_audit_event"("providerId", "createdAt");

-- CreateIndex
CREATE INDEX "provider_audit_event_entityType_entityId_idx" ON "provider_audit_event"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "notification_userId_readAt_createdAt_idx" ON "notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_providerApplicationId_key" ON "invitation"("providerApplicationId");

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_providerApplicationId_fkey" FOREIGN KEY ("providerApplicationId") REFERENCES "provider_application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_provider_profile" ADD CONSTRAINT "service_provider_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_requirement" ADD CONSTRAINT "compliance_requirement_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "service_provider_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_requirement" ADD CONSTRAINT "compliance_requirement_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "compliance_checklist_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_requirement" ADD CONSTRAINT "compliance_requirement_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_document" ADD CONSTRAINT "provider_document_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "service_provider_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_document" ADD CONSTRAINT "provider_document_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "compliance_requirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_assignment" ADD CONSTRAINT "provider_assignment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "service_provider_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_assignment" ADD CONSTRAINT "provider_assignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_assignment" ADD CONSTRAINT "provider_assignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "provider_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_replacesTimeEntryId_fkey" FOREIGN KEY ("replacesTimeEntryId") REFERENCES "time_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_invoice" ADD CONSTRAINT "provider_invoice_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "service_provider_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_invoice" ADD CONSTRAINT "provider_invoice_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "provider_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_invoice" ADD CONSTRAINT "provider_invoice_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_invoice_line" ADD CONSTRAINT "provider_invoice_line_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "provider_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_invoice_line" ADD CONSTRAINT "provider_invoice_line_timeEntryId_fkey" FOREIGN KEY ("timeEntryId") REFERENCES "time_entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_invoice_line" ADD CONSTRAINT "provider_invoice_line_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_form_template" ADD CONSTRAINT "provider_form_template_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_form_version" ADD CONSTRAINT "provider_form_version_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "provider_form_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_form_response" ADD CONSTRAINT "provider_form_response_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "provider_form_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_form_response" ADD CONSTRAINT "provider_form_response_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "provider_form_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_form_response" ADD CONSTRAINT "provider_form_response_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "service_provider_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_form_response" ADD CONSTRAINT "provider_form_response_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "provider_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_delivery" ADD CONSTRAINT "automation_delivery_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_attempt" ADD CONSTRAINT "automation_attempt_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "automation_delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_audit_event" ADD CONSTRAINT "provider_audit_event_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;


