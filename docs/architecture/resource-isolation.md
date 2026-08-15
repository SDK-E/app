# Resource Isolation and Cross-Company Access Rules

## 1. Overview

Every data resource in the platform belongs to exactly one `Company`. This
document defines the ownership model for each resource type, the cross-company
access rules, SDK staff access levels, and the API query filtering requirements
that enforce isolation.

The isolation model has two user categories:

- **Client users** — belong to exactly one company via `Membership`. They can
  only access resources owned by their own company.
- **SDK staff** — are not part of any company. They access resources across
  companies based on their SDK staff role.

---

## 2. Resource Ownership Model

Every resource table carries a `companyId` foreign key referencing `Company.id`.
This is the single source of truth for ownership. There are no exceptions.

| Resource | companyId source | Notes |
|----------|------------------|-------|
| `Request` | Inherited from creating user's Membership | A Request is always created by a client user in their company context |
| `Project` | Inherited from creating user's Membership | A Project is always created within a company |
| `Milestone` | Inherited from parent Project | A Milestone belongs to the same company as its Project |
| `Document` | Inherited from parent Project or Request | A Document belongs to the same company as its parent entity |
| `Message` | Inherited from parent Project or Request | A Message belongs to the same company as its parent entity |
| `Invoice` | Inherited from parent Project or Request | An Invoice belongs to the same company as its parent entity |

### 2.1 Inheritance Rules

When a child resource is created under a parent, its `companyId` is inherited
from the parent and **must not** be supplied by the client. This eliminates the
possibility of a client user assigning a resource to the wrong company.

```
Project (companyId = X)
  └── Milestone (companyId = X, inherited)
        └── Document (companyId = X, inherited)
        └── Message (companyId = X, inherited)
        └── Invoice (companyId = X, inherited)

Request (companyId = X, from Membership)
  └── Document (companyId = X, inherited)
  └── Message (companyId = X, inherited)
  └── Invoice (companyId = X, inherited)
```

### 2.2 Creation Authority

| Actor | Can Create Resource | Condition |
|-------|---------------------|-----------|
| Client user (`COMPANY_ADMIN`, `MEMBER`) | Yes | In their own company only |
| Client user (`VIEWER`) | No | — |
| SDK staff (`SUPER_ADMIN`, `ADMIN`) | Yes | Any company (platform-level) |
| SDK staff (`STAFF`) | Read-only | Cannot create resources |

---

## 3. Cross-Company Access Rules

### 3.1 Client User Isolation

A client user can **only** access resources owned by their active company
(`Membership.companyId`). Any query, mutation, or route handler that returns
resources for a client user **must** filter by `companyId`.

**Hard rule:** Company A users can NEVER access Company B resources. This is
enforced at the data access layer, not just the UI.

| Operation | Client User Scope | Enforcement |
|-----------|-------------------|-------------|
| List resources | Own company only | Query filter: `WHERE companyId = session.companyId` |
| Read resource | Own company only | Query filter + ownership check |
| Create resource | Own company only | `companyId` inherited, not supplied |
| Update resource | Own company only | Ownership check before update |
| Delete resource | Own company only | Ownership check before delete |

### 3.2 Cross-Company Access by SDK Staff

SDK staff roles have different access levels across companies.

| SDK Staff Role | Cross-Company Access | Notes |
|----------------|----------------------|-------|
| `SUPER_ADMIN` | Full (read + write + admin) across all companies | Can manage any company's resources |
| `ADMIN` | Full (read + write + admin) across all companies | Same as SUPER_ADMIN except cannot manage SUPER_ADMIN staff |
| `STAFF` | Read-only across all companies | Cannot create, update, or delete resources |

**Rule:** SDK staff access to company resources is scoped by their role, not by
membership. They have no `Membership` and no default `companyId`. When accessing
a specific company's resources, the target company must be explicitly specified
(e.g., via a route parameter or query parameter).

---

## 4. API Query Filtering Requirements

### 4.1 Mandatory companyId Filter

**Every** data query that returns resources for a client user **must** include a
`companyId` filter. This is non-negotiable.

```typescript
// REQUIRED pattern for client user queries
const resources = await prisma.resource.findMany({
  where: {
    companyId: session.companyId, // mandatory filter
  },
});
```

### 4.2 Query Requirements by User Type

| User Type | companyId Source | Filter Requirement |
|-----------|------------------|-------------------|
| Client user | `session.companyId` | **Mandatory** on every query |
| SDK staff (`SUPER_ADMIN`, `ADMIN`) | Route/query parameter | Required when accessing a specific company |
| SDK staff (`STAFF`) | Route/query parameter | Required when reading a specific company |

### 4.3 Filtering Enforcement Points

Isolation must be enforced at multiple layers:

1. **Route guard** — Reject requests from client users without an active
   `companyId` in their session.
2. **Repository layer** — Every repository method that accepts a `companyId`
   must validate it against the session before executing.
3. **Database query** — All Prisma queries include `companyId` in the `where`
   clause. No query may omit this filter for client users.
4. **Response serialization** — API responses must not include `companyId` in
   the response body for client users (they already know it). For SDK staff,
   `companyId` is included to identify the owning company.

### 4.4 Prohibited Patterns

These patterns are **never** allowed:

```typescript
// FORBIDDEN: No companyId filter for client user
const resources = await prisma.resource.findMany();

// FORBIDDEN: Client user supplies companyId (could spoof another company)
const resources = await prisma.resource.findMany({
  where: { companyId: req.body.companyId },
});

// FORBIDDEN: Filtering only by ID without companyId
const resource = await prisma.resource.findUnique({
  where: { id: resourceId },
});
```

```typescript
// REQUIRED: Always filter by session companyId for client users
const resources = await prisma.resource.findMany({
  where: { companyId: session.companyId },
});

// REQUIRED: For SDK staff, require explicit companyId parameter
const resources = await prisma.resource.findMany({
  where: { companyId: targetCompanyId },
});
```

---

## 5. Resource-Specific Isolation Rules

### 5.1 Request

| Rule | Description |
|------|-------------|
| Ownership | `companyId` inherited from creating user's Membership |
| Client access | Full access to requests in own company |
| SDK staff (`SUPER_ADMIN`, `ADMIN`) | Full access to all requests across companies |
| SDK staff (`STAFF`) | Read-only access to all requests across companies |
| Cross-company | Company A users cannot see or modify Company B requests |

### 5.2 Project

| Rule | Description |
|------|-------------|
| Ownership | `companyId` inherited from creating user's Membership |
| Client access | Full access to projects in own company |
| SDK staff (`SUPER_ADMIN`, `ADMIN`) | Full access to all projects across companies |
| SDK staff (`STAFF`) | Read-only access to all projects across companies |
| Cross-company | Company A users cannot see or modify Company B projects |
| Cascade | Deleting a Project cascades to its Milestones, Documents, Messages, and Invoices |

### 5.3 Milestone

| Rule | Description |
|------|-------------|
| Ownership | `companyId` inherited from parent Project |
| Client access | Full access to milestones in own company (via Project membership) |
| SDK staff (`SUPER_ADMIN`, `ADMIN`) | Full access to all milestones across companies |
| SDK staff (`STAFF`) | Read-only access to all milestones across companies |
| Cross-company | Company A users cannot see or modify Company B milestones |
| Orphan prevention | A Milestone cannot exist without a Project; deleting a Project deletes its Milestones |

### 5.4 Document

| Rule | Description |
|------|-------------|
| Ownership | `companyId` inherited from parent Project or Request |
| Client access | Full access to documents in own company (via parent entity membership) |
| SDK staff (`SUPER_ADMIN`, `ADMIN`) | Full access to all documents across companies |
| SDK staff (`STAFF`) | Read-only access to all documents across companies |
| Cross-company | Company A users cannot see or modify Company B documents |
| Orphan prevention | A Document must have a parent Project or Request |

### 5.5 Message

| Rule | Description |
|------|-------------|
| Ownership | `companyId` inherited from parent Project or Request |
| Client access | Full access to messages in own company (via parent entity membership) |
| SDK staff (`SUPER_ADMIN`, `ADMIN`) | Full access to all messages across companies |
| SDK staff (`STAFF`) | Read-only access to all messages across companies |
| Cross-company | Company A users cannot see or modify Company B messages |
| Orphan prevention | A Message must have a parent Project or Request |

### 5.6 Invoice

| Rule | Description |
|------|-------------|
| Ownership | `companyId` inherited from parent Project or Request |
| Client access | `COMPANY_ADMIN` can view and manage invoices in own company; `MEMBER` and `VIEWER` have read-only access |
| SDK staff (`SUPER_ADMIN`, `ADMIN`) | Full access to all invoices across companies |
| SDK staff (`STAFF`) | Read-only access to all invoices across companies |
| Cross-company | Company A users cannot see or modify Company B invoices |
| Sensitivity | Invoices contain financial data; access should be logged for audit |

---

## 6. Isolation Enforcement Strategy

### 6.1 Defense in Depth

Isolation is enforced at multiple layers to prevent accidental leakage:

1. **Session validation** — Middleware validates that the session contains a
   valid `companyId` for client users before routing to protected pages.
2. **Route guards** — Server-side route handlers verify the user's role and
   company before executing any logic.
3. **Repository filters** — Every database query includes `companyId`. The
   repository interface enforces this contract.
4. **API response filtering** — Even if a query were to miss the filter (e.g.,
   a bug), the response serializer strips out resources not owned by the user's
   company. This is a safety net, not the primary enforcement.
5. **Audit logging** — All cross-company access by SDK staff is logged for
   compliance and debugging.

### 6.2 Repository Interface Pattern

```typescript
interface ResourceRepository {
  // Client users: companyId is derived from session, never from input
  findManyForCompany(companyId: string, filters?: Filters): Promise<Resource[]>;

  // SDK staff: explicit companyId required
  findManyForCompanyByStaff(companyId: string, staffRole: StaffRole): Promise<Resource[]>;

  findById(id: string, companyId: string): Promise<Resource | null>;
  create(data: CreateResourceInput, companyId: string): Promise<Resource>;
  update(id: string, data: UpdateResourceInput, companyId: string): Promise<Resource>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### 6.3 Ownership Validation

Before any update or delete operation, the system must verify that the resource
belongs to the requesting user's company (or that the requester is SDK staff with
sufficient permissions).

```typescript
async function requireOwnership(resourceId: string, session: Session) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { companyId: true },
  });

  if (!resource) {
    throw new NotFoundError();
  }

  if (session.isSdkStaff) {
    // SDK staff can access any company, but we still log the access
    await logCrossCompanyAccess(session, resource.companyId, resourceId);
    return;
  }

  if (resource.companyId !== session.companyId) {
    throw new ForbiddenError();
  }
}
```

---

## 7. SDK Staff Access Matrix

| Resource | SUPER_ADMIN | ADMIN | STAFF |
|----------|-------------|-------|-------|
| Request | CRUD all | CRUD all | Read all |
| Project | CRUD all | CRUD all | Read all |
| Milestone | CRUD all | CRUD all | Read all |
| Document | CRUD all | CRUD all | Read all |
| Message | CRUD all | CRUD all | Read all |
| Invoice | CRUD all | CRUD all | Read all |

**Legend:** C = Create, R = Read, U = Update, D = Delete

### 7.1 SDK Staff Company Context

When SDK staff access a specific company's resources, they must specify the
target company. The system must validate that the company exists and is active.

```typescript
// SDK staff route example
// GET /api/admin/companies/[companyId]/projects
async function getProjectsForCompany(companyId: string, session: Session) {
  if (!session.isSdkStaff) {
    throw new ForbiddenError();
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new NotFoundError();
  }

  await logCrossCompanyAccess(session, companyId);

  return prisma.project.findMany({
    where: { companyId },
  });
}
```

---

## 8. Invariants

1. Every resource has exactly one `companyId`. There are no company-less resources.
2. `companyId` is inherited from the parent entity or the user's Membership at
   creation time. It is immutable after creation.
3. Client users can only query resources where `companyId` matches their active
   `Membership.companyId`.
4. SDK staff have no `Membership` and no default `companyId`. They must explicitly
   specify a company when accessing company-specific resources.
5. Cross-company access by SDK staff is always logged.
6. The `(userId, companyId)` unique constraint on `Membership` ensures a client
   user belongs to exactly one company.
7. Deleting a Company does not automatically delete its resources. Resources
   become orphaned and must be handled by a cleanup process.

---

## 9. Open Questions

- Should `SUPER_ADMIN` be able to impersonate a client user for support?
- Should there be a company-level audit log for all resource access?
- How are orphaned resources handled when a company is deleted?
- Should `STAFF` have company-specific permissions, or only platform-wide?
