# SDK Enterprises — Architecture Overview

## 1. Purpose

This document is the single source of truth for all architectural decisions in the
SDK Enterprises platform. It summarizes the identity model, authentication strategy,
role model, resource isolation, database choice, and type system. Cross-references
to detailed ADRs and design docs are provided for each topic.

---

## 2. System Context

The platform is a B2B application with two disjoint user categories:

- **Client users** — belong to exactly one company via a `Membership`.
- **SDK staff** — are NOT part of any client company; they operate at the platform level.

All client data is scoped to a company. SDK staff have cross-company access
governed by their staff role.

**Tech stack:** Next.js 16, TypeScript, Tailwind CSS, Prisma (PostgreSQL), Auth0.

---

## 3. Authentication Strategy

**Decision:** Use Auth0 for authentication only. Do NOT use Auth0 Organizations.

Identity (User, Company, Membership) lives in our database. Auth0 handles
authentication (password, social, enterprise SSO) and returns a stable `sub` claim.
Our database is the source of truth for identity and company associations.

**Why not Auth0 Organizations:**
- SDK staff are not in any company; Organizations assumes every user belongs to an org.
- Company and Membership are core domain entities; keeping them in our database avoids a
  dual-source-of-truth problem.
- Membership semantics differ; our Membership entity carries role, invitation state, and
  lifecycle dates.
- Vendor lock-in concerns.

**Why not pure custom auth:**
- Enterprise customers expect IdP integration (SAML/OIDC).
- Password security, MFA, breach detection, and session security are hard to get right.

**Reference:** [ADR-001: Authentication Provider Strategy](adr/001-auth-provider-strategy.md),
[docs/architecture/auth-architecture.md](architecture/auth-architecture.md)

### 3.1 Environment Variables

| Variable | Purpose | Server-only |
|----------|---------|-------------|
| `AUTH0_SECRET` | Session encryption secret | Yes |
| `AUTH0_ISSUER_BASE_URL` | Auth0 domain | Yes |
| `AUTH0_BASE_URL` | Application base URL | Yes |
| `AUTH0_CLIENT_ID` | Auth0 application client ID | No |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment mode | No |

All environment variables must be validated at startup. Code must never call `process.env` directly. Missing production variables cause the application to fail at startup.

**Reference:** [docs/data-strategy.md](../data-strategy.md)

---

## 4. Identity Model

**Decision:** The shared `User` entity represents all users. `Company` and `Membership`
exist only for client users. SDK staff have no `Membership` and no `companyId`.

### 4.1 Entities

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| `User` | `id` (UUID), `auth0Sub` (unique), `email` (unique), `name`, `isActive`, `lastLoginAt` | Shared by all users |
| `Company` | `id` (UUID), `name`, `slug` (unique), `isActive` | Client companies only |
| `Membership` | `id` (UUID), `userId`, `companyId`, `role` (enum), `invitedBy`, `invitedAt`, `joinedAt` | Links User to Company |

**Unique constraint:** `(userId, companyId)` on Membership.

### 4.2 Invariants

1. A `User` may have zero or one active `Membership`.
2. A `Membership` links exactly one `User` to exactly one `Company`.
3. Deleting a `User` cascades to their `Membership` rows.
4. Deleting a `Company` cascades to its `Membership` rows.
5. `auth0Sub` is immutable and maps 1:1 to an Auth0 user.
6. SDK staff have no `Membership` and no `companyId`.
7. A `User` cannot be both SDK staff and a client user simultaneously.

### 4.3 Session Shape

The session cookie stores the following claims:

```typescript
interface SessionClaims {
  sub: string;              // Auth0 user.sub
  email: string;            // Verified email
  name: string;             // Display name
  picture?: string;         // Avatar URL (optional)
  companyId?: string;       // Active company ID (null for SDK staff)
  membershipRole?: string;  // COMPANY_ADMIN | MEMBER | VIEWER
  isSdkStaff: boolean;      // true if user has no company
  sdkStaffRole?: string;    // SUPER_ADMIN | ADMIN | STAFF
  iat: number;
  exp: number;
}
```

**Reference:** [docs/architecture/identity-model.md](architecture/identity-model.md)

---

## 5. Role Model

**Decision:** Two disjoint role enums: `ClientRole` (for company members) and
`SdkStaffRole` (for platform operators). No user can hold both simultaneously.

### 5.1 Client Roles (Membership.role)

| Role | Permissions |
|------|-------------|
| `COMPANY_ADMIN` | Full access within company: invite/remove members, manage projects, view invoices |
| `MEMBER` | Create and edit company resources, cannot manage members |
| `VIEWER` | Read-only access to company resources |

### 5.2 SDK Staff Roles

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Full platform admin: manage all companies, manage all staff, platform settings |
| `ADMIN` | Platform admin: manage companies, manage staff (excluding SUPER_ADMIN) |
| `STAFF` | Read-only access to company data, restricted admin operations |

### 5.3 Role Hierarchy

```
SUPER_ADMIN
  └── inherits all ADMIN + STAFF permissions
  └── can manage all staff including ADMIN and STAFF

ADMIN
  └── inherits all STAFF permissions
  └── can manage STAFF accounts
  └── can read companies and memberships across all companies

STAFF
  └── read-only access to company data
  └── cannot modify staff

COMPANY_ADMIN
  └── inherits all MEMBER + VIEWER permissions
  └── full control within their company
  └── can invite/remove members

MEMBER
  └── inherits all VIEWER permissions
  └── can create and edit most company resources

VIEWER
  └── read-only access within their company
```

**Reference:** [docs/architecture/rbac.md](architecture/rbac.md)

---

## 6. Resource Isolation Strategy

**Decision:** Every resource table carries a `companyId` foreign key. Client users
can only access resources in their own company. SDK staff access is scoped by their
staff role, not by membership.

### 6.1 Ownership Model

Every resource belongs to exactly one `Company` via `companyId`.

| Resource | companyId Source |
|----------|-----------------|
| `Request` | Inherited from creating user's Membership |
| `Project` | Inherited from creating user's Membership or parent Request |
| `Milestone` | Inherited from parent Project |
| `Document` | Inherited from parent Project, Milestone, or Request |
| `Message` | Inherited from parent Project, Milestone, or Request |
| `Invoice` | Inherited from parent Project, Milestone, or Request |

### 6.2 Isolation Enforcement Layers

1. **Session validation** — Middleware validates active `companyId` for client users.
2. **Route guards** — Server-side route handlers verify role and company.
3. **Repository filters** — Every database query includes `companyId`.
4. **Response filtering** — API responses do not include resources from other companies.

### 6.3 Cross-Company Access by SDK Staff

| SDK Staff Role | Cross-Company Access |
|----------------|---------------------|
| `SUPER_ADMIN` | Full (read + write + admin) across all companies |
| `ADMIN` | Full (read + write + admin) across all companies |
| `STAFF` | Read-only across all companies |

**Reference:** [docs/architecture/resource-isolation.md](architecture/resource-isolation.md)

---

## 7. Database Strategy

**Decision:** PostgreSQL via Prisma ORM. Separate databases per environment
(development vs production). Production data is never seeded or manipulated by
development tooling.

### 7.1 Environment Isolation

| Environment | Database | Seed Data |
|-------------|----------|-----------|
| Development | Local file or Docker Postgres | Yes (synthetic only) |
| Production | Managed Postgres | Never |

### 7.2 Safety Rules

1. **Never seed production.** The seed script checks `NODE_ENV !== 'production'`.
2. **No fake sensitive data in production.**
3. **No fallbacks to development defaults.** Missing production config fails at startup.
4. **Production writes are explicit.** Code paths that write to the database require
   an explicit `allowWrite` flag or `NODE_ENV !== 'production'` check.

### 7.3 Prisma Schema

The Prisma schema (`prisma/schema.prisma`) is the authoritative definition of the
data model. It is generated from the domain model and kept in sync.

**Reference:** [docs/data-strategy.md](../data-strategy.md)

---

## 8. Type System

**Decision:** Shared TypeScript types in `src/types/index.ts` define the canonical
shapes for users, sessions, and API responses. These types must stay in sync with
the Prisma schema and the documented identity model.

### Current Types

```typescript
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Known Gaps

- No role enums exist in the type system. `ClientRole` and `SdkStaffRole` must be added to match the domain model.
- No `User` or `Session` interfaces exist. These must be added to represent the identity and session models.
- Auth guard functions are not yet implemented.

---

## 9. Permission Enforcement

**Decision:** All permission checks are server-side. No client-side code enforces
permissions; all checks happen server-side.

### Enforcement Layers

1. **Next.js Proxy (Middleware)** — Coarse access control (public, authenticated, admin, client routes).
2. **Server Actions** — Guard functions enforce role and permission checks.
3. **API Route Handlers** — Same guard pattern as server actions.

### Guard Functions

- `requireAuth(session)` — user must be authenticated
- `requireRole(session, allowedRoles)` — user must have one of the specified roles
- `requireCompanyAccess(session, companyId)` — user must belong to the company
- `requireStaffRole(session, minRole)` — SDK staff must meet minimum role level *(documented but not yet implemented)*

---

## 10. Domain Model Summary

The platform has 9 core entities:

- `User` — all users (client + SDK staff)
- `Company` — client companies
- `Membership` — links User to Company with a role
- `Request` — client request submitted to the platform
- `Project` — project spawned from a Request or created directly
- `Milestone` — milestone within a Project
- `Document` — file attached to a Project, Milestone, or Request
- `Message` — text message attached to a Project, Milestone, or Request
- `Invoice` — financial invoice for a Project, Milestone, or Request

All data-carrying entities carry a `companyId`. Child entities inherit `companyId`
from their parent at creation time; it is never supplied by the client and is
immutable after creation.

**Reference:** [docs/architecture/domain-model.md](architecture/domain-model.md)

---

## 11. Project Structure

The project follows Next.js 16 App Router conventions:

- `src/app/` — routes and layouts
- `src/components/` — shared React components
- `src/lib/` — server-only utilities (auth, env, data access)
- `src/types/` — shared TypeScript types
- Proxy layer — Next.js proxy (formerly middleware) for route-level access control
- `prisma/` — Prisma schema and migrations
- `docs/` — project documentation

**Reference:** [docs/conventions/structure.md](conventions/structure.md)

---

## 12. Open Questions

### 12.1 Unresolved Design Questions

1. **SDK staff role persistence** — How are `SUPER_ADMIN`, `ADMIN`, and `STAFF` roles
   stored? The current Prisma schema has no field for SDK staff roles. Should there be
   a separate `StaffRole` table, or a `sdkStaffRole` enum on `User`?

2. **Type system alignment** — `src/types/index.ts` currently defines only `BaseEntity`, `ApiResponse`, and `PaginatedResult`. No role or user types exist yet. Should `ClientRole`, `SdkStaffRole`, `User`, and `Session` interfaces be added to match the domain model?

3. **Session type alignment** — `src/types/index.ts` lacks a session type entirely. Should a session interface be added to represent `SessionClaims` with `isSdkStaff`, `sdkStaffRole`, and `membershipRole`?

4. **`companyId` for SDK staff** — The identity model says SDK staff are
   identified by having no Membership. No `User` interface exists in
   `src/types/index.ts` yet. Should one be added with an optional `companyId`,
   or should SDK staff be represented differently?

5. **`requireStaffRole` implementation** — This guard is documented in the RBAC
   design but not implemented. `src/lib/auth-guards.ts` exists and provides
   `requireAuth`, `requireRole` and `requireCompanyAccess`; `requireStaffRole`
   is the remaining one. What is the priority for implementation?

6. **`isSdkStaff` in the database** — The identity model says SDK staff are
   identified by having no Membership. Should an explicit `isSdkStaff` boolean
   be added to the `User` model for clarity, or is the absence of Membership
   sufficient?

7. **Super admin impersonation** — Should `SUPER_ADMIN` be able to impersonate a
   client user for support? This would require session elevation capabilities.

8. **COMPANY_ADMIN promotion** — Can a `COMPANY_ADMIN` promote a `MEMBER` to
   `COMPANY_ADMIN` without SDK staff involvement?

9. **Maximum members per company** — Is there a limit on the number of members
   a company can have?

10. **STAFF company-specific permissions** — Should `STAFF` have company-specific
    read-only permissions, or only platform-wide access?

11. **Multi-company users** — If a user needs to belong to multiple companies
    simultaneously, how should the `Membership` model change?

12. **Audit logging** — Where and how should authentication events and
    cross-company access by SDK staff be logged for compliance?


---

## 13. References

| Document | Description |
|----------|-------------|
| [ADR-001: Authentication Provider Strategy](adr/001-auth-provider-strategy.md) | Why Auth0 without Organizations |
| [docs/architecture/auth-architecture.md](architecture/auth-architecture.md) | Detailed auth architecture |
| [docs/architecture/identity-model.md](architecture/identity-model.md) | User, Company, Membership entities |
| [docs/architecture/rbac.md](architecture/rbac.md) | Role model and permission enforcement |
| [docs/architecture/resource-isolation.md](architecture/resource-isolation.md) | Cross-company access rules |
| [docs/architecture/domain-model.md](architecture/domain-model.md) | Complete entity reference |
| [docs/data-strategy.md](../data-strategy.md) | Environment and database isolation |
| [docs/conventions/structure.md](../conventions/structure.md) | Project structure and conventions |
