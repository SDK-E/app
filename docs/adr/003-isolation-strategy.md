# ADR-003: Isolation Strategy

## Status

Accepted

## Context

The platform serves multiple independent companies. Client users must never
access data from other companies. SDK staff need cross-company access, but
their access must be logged and scoped by their staff role.

We need an isolation strategy that:
1. Guarantees client users can only see their own company's data.
2. Allows SDK staff to access any company's data with appropriate logging.
3. Is enforced at multiple layers (database queries, route handlers, repositories).
4. Does not rely on client-side enforcement.

## Options Considered

1. **Row-Level Security (RLS) in the database** — Use Postgres RLS policies to
   filter rows by `companyId` based on the current user's session.
2. **Application-level query filters** — Every repository method includes a
   `companyId` filter; no RLS.
3. **Hybrid** — RLS as a safety net, plus application-level filters.

## Decision

Use **application-level query filters as the primary enforcement mechanism**.
Database RLS is deferred to a future phase.

Every data query for client users **must** include a `companyId` filter derived
from the session. SDK staff queries include an explicit `companyId` parameter.

### Mandatory Patterns

```typescript
// REQUIRED: Client user query
const resources = await prisma.resource.findMany({
  where: { companyId: session.companyId },
});

// REQUIRED: SDK staff query (explicit companyId)
const resources = await prisma.resource.findMany({
  where: { companyId: targetCompanyId },
});
```

### Prohibited Patterns

```typescript
// FORBIDDEN: No companyId filter for client user
const resources = await prisma.resource.findMany();

// FORBIDDEN: Client user supplies companyId (spoofing risk)
const resources = await prisma.resource.findMany({
  where: { companyId: req.body.companyId },
});
```

## Rationale

- **Defense in depth**: Multiple enforcement layers (middleware, route guards,
  repository filters, response serialization) prevent accidental leakage.
- **Explicit is better than implicit**: Every query explicitly shows which
  company's data it accesses. This makes code reviews and audits easier.
- **Flexibility**: Application-level filters allow complex authorization logic
  (e.g., checking the user's role, logging cross-company access) that RLS
  alone cannot express cleanly.
- **Portability**: Application-level filters work across database providers;
  RLS is Postgres-specific.

## Consequences

- Every repository method that returns resources must accept or derive a
  `companyId`.
- Developers must remember to include the filter in every query. This is a
  discipline burden.
- Without RLS, a bug in a single query could expose data. The defense-in-depth
  layers (response filtering, audit logging) mitigate this risk.
- SDK staff routes must validate that the requested company exists and is active
  before returning data.

## Enforcement Layers

1. **Session validation** — Middleware validates `companyId` for client users.
2. **Route guards** — Server-side handlers verify role and company access.
3. **Repository filters** — Every query includes `companyId`.
4. **Response serialization** — API responses do not include resources from
   other companies.

## Cross-Company Access by SDK Staff

| SDK Staff Role | Cross-Company Access |
|----------------|---------------------|
| `SUPER_ADMIN` | Full (read + write + admin) across all companies |
| `ADMIN` | Full (read + write + admin) across all companies |
| `STAFF` | Read-only across all companies |

Cross-company access by SDK staff is always logged for compliance.

## Open Questions

- Should `SUPER_ADMIN` be able to impersonate a client user for support?
- Should there be a company-level audit log for all resource access?
- How are orphaned resources handled when a company is deleted?
- Should `STAFF` have company-specific permissions, or only platform-wide access?

## References

- [docs/architecture/resource-isolation.md](../architecture/resource-isolation.md)
- [docs/architecture/rbac.md](../architecture/rbac.md)
