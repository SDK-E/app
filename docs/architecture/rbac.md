# Role-Based Access Control (RBAC)

## 1. Overview

This document defines the RBAC model for the SDK Enterprises platform.
There are two disjoint user categories, each with its own role hierarchy:

- **SDK staff** — platform-level operators with no company association.
- **Client users** — belong to exactly one `Company` via a `Membership`.

Permissions are checked at three boundaries: Next.js proxy, server
actions, and API route handlers. No client-side code enforces permissions;
all checks happen server-side.

## 2. Permission Enum

A single `Permission` enum covers all operations across every resource.

```typescript
enum Permission {
  // Company (client)
  COMPANY_VIEW = 'company:view',
  COMPANY_UPDATE = 'company:update',

  // Membership
  MEMBERSHIP_INVITE = 'membership:invite',
  MEMBERSHIP_REMOVE = 'membership:remove',
  MEMBERSHIP_VIEW = 'membership:view',

  // Request
  REQUEST_VIEW = 'request:view',
  REQUEST_CREATE = 'request:create',
  REQUEST_UPDATE = 'request:update',
  REQUEST_DELETE = 'request:delete',

  // Project
  PROJECT_VIEW = 'project:view',
  PROJECT_CREATE = 'project:create',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',

  // Milestone
  MILESTONE_VIEW = 'milestone:view',
  MILESTONE_CREATE = 'milestone:create',
  MILESTONE_UPDATE = 'milestone:update',
  MILESTONE_DELETE = 'milestone:delete',

  // Document
  DOCUMENT_VIEW = 'document:view',
  DOCUMENT_CREATE = 'document:create',
  DOCUMENT_UPDATE = 'document:update',
  DOCUMENT_DELETE = 'document:delete',

  // Message
  MESSAGE_VIEW = 'message:view',
  MESSAGE_CREATE = 'message:create',
  MESSAGE_UPDATE = 'message:update',
  MESSAGE_DELETE = 'message:delete',

  // Invoice
  INVOICE_VIEW = 'invoice:view',
  INVOICE_CREATE = 'invoice:create',
  INVOICE_UPDATE = 'invoice:update',
  INVOICE_DELETE = 'invoice:delete',

  // SDK Staff management (platform-level)
  STAFF_VIEW = 'staff:view',
  STAFF_CREATE = 'staff:create',
  STAFF_UPDATE = 'staff:update',
  STAFF_DELETE = 'staff:delete',

  // Platform settings
  PLATFORM_SETTINGS_VIEW = 'platform:settings:view',
  PLATFORM_SETTINGS_UPDATE = 'platform:settings:update',
}
```

## 3. Role Enum

```typescript
enum SdkStaffRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

enum ClientRole {
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}
```

## 4. Role-to-Permission Mapping

### 4.1 Client Roles

| Permission | COMPANY_ADMIN | MEMBER | VIEWER |
|------------|:---:|:---:|:---:|
| `company:view` | Yes | Yes | Yes |
| `company:update` | Yes | No | No |
| `membership:view` | Yes | Yes | Yes |
| `membership:invite` | Yes | No | No |
| `membership:remove` | Yes (not self, not other admins) | No | No |
| `request:view` | Yes | Yes | Yes |
| `request:create` | Yes | Yes | No |
| `request:update` | Yes | Yes | No |
| `request:delete` | Yes | No | No |
| `project:view` | Yes | Yes | Yes |
| `project:create` | Yes | Yes | No |
| `project:update` | Yes | Yes | No |
| `project:delete` | Yes | No | No |
| `milestone:view` | Yes | Yes | Yes |
| `milestone:create` | Yes | Yes | No |
| `milestone:update` | Yes | Yes | No |
| `milestone:delete` | Yes | No | No |
| `document:view` | Yes | Yes | Yes |
| `document:create` | Yes | Yes | No |
| `document:update` | Yes | Yes | No |
| `document:delete` | Yes | No | No |
| `message:view` | Yes | Yes | Yes |
| `message:create` | Yes | Yes | Yes |
| `message:update` | Yes | Yes (own) | No |
| `message:delete` | Yes | Yes (own) | No |
| `invoice:view` | Yes | Yes | Yes |
| `invoice:create` | Yes | No | No |
| `invoice:update` | Yes | No | No |
| `invoice:delete` | Yes | No | No |

### 4.2 SDK Staff Roles

| Permission | SUPER_ADMIN | ADMIN | STAFF |
|------------|:---:|:---:|:---:|
| `company:view` | Yes | Yes | Yes |
| `company:update` | Yes | Yes | No |
| `membership:view` | Yes | Yes | Yes |
| `membership:invite` | Yes | Yes | No |
| `membership:remove` | Yes | Yes | No |
| `request:view` | Yes | Yes | Yes |
| `request:create` | Yes | Yes | No |
| `request:update` | Yes | Yes | No |
| `request:delete` | Yes | Yes | No |
| `project:view` | Yes | Yes | Yes |
| `project:create` | Yes | Yes | No |
| `project:update` | Yes | Yes | No |
| `project:delete` | Yes | Yes | No |
| `milestone:view` | Yes | Yes | Yes |
| `milestone:create` | Yes | Yes | No |
| `milestone:update` | Yes | Yes | No |
| `milestone:delete` | Yes | Yes | No |
| `document:view` | Yes | Yes | Yes |
| `document:create` | Yes | Yes | No |
| `document:update` | Yes | Yes | No |
| `document:delete` | Yes | Yes | No |
| `message:view` | Yes | Yes | Yes |
| `message:create` | Yes | Yes | Yes |
| `message:update` | Yes | Yes | No |
| `message:delete` | Yes | Yes | No |
| `invoice:view` | Yes | Yes | Yes |
| `invoice:create` | Yes | Yes | No |
| `invoice:update` | Yes | Yes | No |
| `invoice:delete` | Yes | Yes | No |
| `staff:view` | Yes | Yes (not SUPER_ADMIN) | No |
| `staff:create` | Yes | Yes (STAFF only) | No |
| `staff:update` | Yes | Yes (not SUPER_ADMIN) | No |
| `staff:delete` | Yes | No | No |
| `platform:settings:view` | Yes | Yes | No |
| `platform:settings:update` | Yes | No | No |

## 5. Role Hierarchy Summary

```
SUPER_ADMIN
  └── inherits all ADMIN + STAFF permissions
  └── can manage all staff including ADMIN and STAFF
  └── full platform settings access

ADMIN
  └── inherits all STAFF permissions
  └── can manage STAFF accounts
  └── can read companies and memberships across all companies
  └── can modify non-ADMIN staff
  └── cannot modify SUPER_ADMIN accounts

STAFF
  └── read-only access to company data
  └── cannot modify staff
  └── cannot access platform settings

COMPANY_ADMIN
  └── inherits all MEMBER + VIEWER permissions
  └── full control within their company
  └── can invite/remove members
  └── can update company settings
  └── cannot remove other COMPANY_ADMIN members

MEMBER
  └── inherits all VIEWER permissions
  └── can create and edit most company resources
  └── can delete own messages
  └── cannot manage members or company settings

VIEWER
  └── read-only access within their company
```

## 6. Permission Enforcement Strategy

All permission checks are server-side. The application enforces access at
three layers: proxy, server actions, and API route handlers.

### 6.1 Next.js Proxy (Middleware)

`src/proxy.ts` protects route segments based on authentication state
and rough role categories. The proxy handles coarse access control:

- **Public routes**: Landing page, login, signup. No session required.
- **Authenticated routes**: Dashboard, client app. Require a valid session.
- **Admin routes**: `/admin/**`. Require `isSdkStaff === true`.
- **Client routes**: `/app/**`. Require an active `Membership` (non-staff).

The proxy does **not** check fine-grained permissions (e.g., can the user
delete a project?). It only ensures the user is authenticated and in the
right broad category.

```typescript
// Conceptual proxy flow
const session = await getSession(request)

if (isPublicRoute(pathname)) {
  return NextResponse.next()
}

if (isAdminRoute(pathname) && !session?.isSdkStaff) {
  return redirectToLogin()
}

if (isClientRoute(pathname) && !session?.companyId) {
  return redirectToLogin()
}

return NextResponse.next()
```

### 6.2 Server Actions

Server actions use guard functions from `src/lib/auth-guards.ts`. Each
action calls the appropriate guard before executing business logic.

Guard functions:
- `requireAuth(session)` — user must be authenticated
- `requireRole(session, role)` — user must have the specified role
- `requirePermission(session, permission)` — user must have the specified permission
- `requireCompanyAccess(session, companyId)` — user must belong to the company
- `requireStaffRole(session, minRole)` — SDK staff must meet minimum role level

```typescript
// Conceptual server action
'use server'

async function deleteProject(projectId: string) {
  const session = await getSession()
  requireAuth(session)
  requirePermission(session, Permission.PROJECT_DELETE)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    throw new Error('Project not found')
  }

  if (session.isSdkStaff) {
    return await prisma.project.delete({ where: { id: projectId } })
  }

  requireCompanyAccess(session, project.companyId)

  return await prisma.project.delete({ where: { id: projectId } })
}
```

### 6.3 API Route Handlers

API routes (`src/app/api/**/route.ts`) follow the same guard pattern. Each
route handler extracts the session, calls the guard, then executes the
repository call.

```typescript
// Conceptual API route
export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getSession()
  requireAuth(session)
  requirePermission(session, Permission.PROJECT_DELETE)

  const project = await getProject(params.projectId)
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!session.isSdkStaff) {
    requireCompanyAccess(session, project.companyId)
  }

  await prisma.project.delete({ where: { id: params.projectId } })
  return NextResponse.json({ success: true })
}
```

### 6.4 Data Query Isolation

All data queries for client users include a `companyId` filter. This is the
defense-in-depth layer: even if a permission check is bypassed, the user can
only see their own company's data.

```typescript
// Conceptual repository query
async function findProjects(companyId: string) {
  return await prisma.project.findMany({
    where: { companyId },
  })
}
```

For SDK staff, queries may omit the `companyId` filter or include an explicit
list of company IDs they are allowed to inspect.

## 7. Permission Source of Truth

The session cookie is the authoritative source of the user's role and
permissions. It is set at login and refreshed on company switch.

```typescript
interface SessionClaims {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  companyId?: string;
  membershipRole?: ClientRole;
  isSdkStaff: boolean;
  sdkStaffRole?: SdkStaffRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}
```

- `membershipRole` is set when the user has an active `Membership`.
- `sdkStaffRole` is set when `isSdkStaff` is true.
- `permissions` is the derived set of `Permission` values for the user's
  current role(s). Server actions and API routes check against this array.

## 8. Cross-Cutting Rules

1. **No client-side permission checks.** The client may hide UI elements
   based on permissions, but every server action and API route must
   independently verify access.
2. **Least privilege.** Grant the minimum permission required for the task.
   Do not grant `COMPANY_ADMIN` when `MEMBER` suffices.
3. **Company isolation is mandatory.** Every data query for client users
   includes a `companyId` filter. SDK staff queries include explicit
   company scope.
4. **Staff roles are immutable by client users.** Only `SUPER_ADMIN` and
   `ADMIN` can create, update, or delete SDK staff accounts.
5. **No dual roles.** A user is either SDK staff or a client user, never
   both. The session reflects exactly one category.
6. **Last admin protection.** A `COMPANY_ADMIN` cannot remove themselves
   from a company if they are the last admin. They must promote another
   member first or delete the company.

## 9. Open Questions

- Should `SUPER_ADMIN` be able to impersonate a client user for support?
- Can a `COMPANY_ADMIN` promote a `MEMBER` to `COMPANY_ADMIN` without SDK
  staff involvement?
- Should `STAFF` have company-specific read-only permissions, or only
  platform-wide access?
- Do we need time-limited or conditional permissions (e.g., temporary
  access for contractors)?
