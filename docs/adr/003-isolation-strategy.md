# ADR-003: Isolation Strategy

## Status

Accepted.

## Decision

Use application-level Prisma query filters as the primary tenant isolation
mechanism. Database RLS remains deferred.

Client company scope is derived exclusively from the database-backed
Membership in `AppPrincipal`. SDK staff must supply an explicit target company.
Every company-resource query includes `companyId`, including direct-ID reads,
updates, and deletes.

The shared authorization helpers are mandatory so future features do not
reinterpret tenant scope independently. Proxy and UI checks are coarse only;
the actual Server Action, route handler, or repository query is authoritative.
