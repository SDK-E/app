# Role-Based Access Control

## Source of truth

PostgreSQL is authoritative for roles and memberships. Auth0 sessions prove
authentication only. `src/lib/permissions.ts` is the single role-to-permission
map; `src/lib/authorization.ts` is the reusable enforcement API.

## Enforcement API

- `requireAuthenticatedUser` rejects anonymous requests.
- `requireAssignedPrincipal` rejects authenticated but unprovisioned users.
- `requireClientPrincipal` and `requireSdkStaff` enforce identity category.
- `hasPermission` and `requirePermission` enforce operations.
- `requireCompanyAccess` derives client scope or requires an SDK target.
- `tenantWhere` composes `companyId` into resource query filters.

UI visibility is optional convenience, never authorization. Every Server
Action, route handler, and resource repository must independently enforce its
permission and tenant scope.

## Role capabilities

- `OWNER`: all client permissions.
- `ADMINISTRATOR`: delivery and membership administration, excluding company
  ownership settings and billing writes.
- `PROJECT_MEMBER`: delivery reads/writes without destructive, member, or
  billing administration.
- `BILLING`: invoice reads plus contextual company/project reads.
- `VIEWER`: read-only client resources.
- `ADMIN`: staff, company (including company creation), delivery, and finance
  administration.
- `DELIVERY`: delivery reads/writes without staff, destructive, or finance administration.
- `FINANCE`: invoice reads/writes plus contextual company/project reads.

`company:create` is an SDK-administrator permission. An SDK-created company has
no members; its first member is provisioned by an SDK-administrator OWNER
invitation (a user can hold only one OWNER membership per company, enforced in
`createClientInvitation`).

The exact permission sets are tested directly. Adding a future operation
requires adding its Permission, updating the centralized maps, and adding
positive and negative tests before resource code uses it.
