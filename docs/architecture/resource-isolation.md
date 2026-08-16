# Resource Isolation and Cross-Company Access

Every client resource carries `companyId`. Company A must never read or mutate
Company B data.

## Mandatory boundary

1. Resolve the current database-backed `AppPrincipal`.
2. Require the operation's Permission.
3. Derive company scope with `requireCompanyAccess`.
4. Query or mutate using both resource identifier and `companyId`.

Client input never selects company scope. A client principal always receives
its Membership company. Supplying a different company is forbidden.

SDK staff have no default company. Every company-resource operation requires an
explicit target company and the matching staff permission. The target company
must exist and be active before a resource operation proceeds.

## Query pattern

```typescript
const assigned = requirePermission(principal, "project:view");
const where = tenantWhere(assigned, { id: projectId }, targetCompanyId);
const project = await prisma.project.findFirst({ where });
```

List, read, update, and delete queries all carry the company filter. Looking up
by resource ID alone and checking ownership afterward is prohibited because it
creates an avoidable cross-tenant disclosure path.

Database RLS is deferred. Application query scoping is mandatory and must be
covered by two-company tests for every future resource repository.
