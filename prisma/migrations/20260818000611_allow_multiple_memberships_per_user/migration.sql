-- DropIndex
-- A user may hold multiple company memberships (1:M). The composite unique
-- (userId, companyId) already prevents duplicate memberships within a company,
-- so the user-level unique index is no longer needed.
DROP INDEX "membership_userId_key";