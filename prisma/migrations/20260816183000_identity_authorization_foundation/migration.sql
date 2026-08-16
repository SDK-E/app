-- Preserve existing role assignments while adopting the expanded role model.
ALTER TYPE "client_role" RENAME VALUE 'COMPANY_ADMIN' TO 'OWNER';
ALTER TYPE "client_role" RENAME VALUE 'MEMBER' TO 'PROJECT_MEMBER';
ALTER TYPE "client_role" ADD VALUE 'ADMINISTRATOR';
ALTER TYPE "client_role" ADD VALUE 'BILLING';

CREATE TYPE "sdk_staff_role" AS ENUM ('ADMIN', 'DELIVERY', 'FINANCE');

ALTER TABLE "user" ADD COLUMN "sdkStaffRole" "sdk_staff_role";

-- Do not silently discard ambiguous membership data. A deployment with users
-- in more than one company must be reconciled before this migration can run.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "membership"
    GROUP BY "userId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot enforce one-company membership: duplicate userId values exist in membership';
  END IF;
END $$;

CREATE UNIQUE INDEX "membership_userId_key" ON "membership"("userId");
