CREATE TYPE "invitation_kind" AS ENUM ('CLIENT', 'SDK_STAFF');
CREATE TYPE "invitation_delivery_status" AS ENUM ('PENDING', 'SENT', 'FAILED');

ALTER TABLE "user"
ADD COLUMN "preferredLocale" VARCHAR(5) NOT NULL DEFAULT 'en';

CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "kind" "invitation_kind" NOT NULL,
    "companyId" TEXT,
    "clientRole" "client_role",
    "sdkStaffRole" "sdk_staff_role",
    "invitedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "revokedAt" TIMESTAMP(3),
    "deliveryStatus" "invitation_delivery_status" NOT NULL DEFAULT 'PENDING',
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invitation_target_check" CHECK (
      ("kind" = 'CLIENT' AND "companyId" IS NOT NULL AND "clientRole" IS NOT NULL AND "sdkStaffRole" IS NULL)
      OR
      ("kind" = 'SDK_STAFF' AND "companyId" IS NULL AND "clientRole" IS NULL AND "sdkStaffRole" IS NOT NULL)
    )
);

CREATE UNIQUE INDEX "invitation_tokenHash_key" ON "invitation"("tokenHash");
CREATE INDEX "invitation_email_idx" ON "invitation"("email");
CREATE INDEX "invitation_companyId_idx" ON "invitation"("companyId");
CREATE INDEX "invitation_invitedBy_idx" ON "invitation"("invitedBy");
CREATE INDEX "invitation_expiresAt_idx" ON "invitation"("expiresAt");
CREATE INDEX "invitation_createdAt_idx" ON "invitation"("createdAt");

ALTER TABLE "invitation" ADD CONSTRAINT "invitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
