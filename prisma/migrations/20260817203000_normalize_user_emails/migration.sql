-- Normalize existing user emails to lowercase so the application can treat
-- email as case-insensitive identity. Case-variant duplicates are resolved
-- deterministically: within each group the account with an application
-- assignment survives, then the most recently logged in, then the oldest.
-- Displaced accounts are deactivated and given a unique suffixed email so the
-- unique constraint holds and their next login surfaces the application's
-- INACTIVE_USER / identity-conflict guidance instead of silently duplicating.

WITH canonical AS (
  SELECT
    u.id,
    LOWER(u.email) AS canonical_email,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(u.email)
      ORDER BY
        CASE
          WHEN u."sdkStaffRole" IS NOT NULL
               OR EXISTS (SELECT 1 FROM "membership" m WHERE m."userId" = u.id)
          THEN 0
          ELSE 1
        END,
        u."lastLoginAt" DESC NULLS LAST,
        u."createdAt" ASC,
        u.id ASC
    ) AS rn
  FROM "user" u
)
UPDATE "user" u
SET
  email = CASE
    WHEN c.rn = 1 THEN c.canonical_email
    ELSE c.canonical_email || '+dup-' || u.id
  END,
  "isActive" = CASE WHEN c.rn > 1 THEN FALSE ELSE u."isActive" END,
  "updatedAt" = NOW()
FROM canonical c
WHERE u.id = c.id
  AND (u.email <> c.canonical_email OR c.rn > 1);