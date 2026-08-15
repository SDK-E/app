# Identity Model

## 1. Overview

This document defines the core identity model for the SDK Enterprises platform.
There are two disjoint user categories:

- **Client users** — belong to exactly one company via a `Membership`.
- **SDK staff** — are NOT part of any client company.

`User` is the shared entity for all users. `Company` and `Membership` exist
only for client users. SDK staff have no `Membership` and no `companyId`.

---

## 2. Entities

### 2.1 User

Shared attributes for all users (both client and SDK staff).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID (PK) | |
| `auth0Sub` | string, unique | Auth0 `sub` claim; immutable |
| `email` | string, unique, indexed | Verified by Auth0 |
| `name` | string | Display name |
| `avatarUrl` | string, nullable | |
| `isActive` | boolean | Soft delete flag |
| `lastLoginAt` | datetime, nullable | |
| `createdAt` | datetime | |
| `updatedAt` | datetime | |

### 2.2 Company

A client company. Only client users can belong to a company.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID (PK) | |
| `name` | string | |
| `slug` | string, unique, indexed | URL-safe identifier |
| `isActive` | boolean | Soft delete flag |
| `createdAt` | datetime | |
| `updatedAt` | datetime | |

### 2.3 Membership

Links exactly one `User` to exactly one `Company` with a role.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID (PK) | |
| `userId` | UUID (FK → User.id) | |
| `companyId` | UUID (FK → Company.id) | |
| `role` | enum | `COMPANY_ADMIN` \| `MEMBER` \| `VIEWER` |
| `invitedBy` | UUID (FK → User.id), nullable | User who sent the invitation |
| `invitedAt` | datetime, nullable | |
| `joinedAt` | datetime, nullable | Set when invitee accepts |
| `createdAt` | datetime | |
| `updatedAt` | datetime | |

**Unique constraint:** `(userId, companyId)`

---

## 3. Relationships

```
User ──< Membership >── Company

User ──< Membership (invitedBy) >── User
```

| Relationship | Cardinality | Notes |
|--------------|-------------|-------|
| User → Membership | 0..1 | A user may have zero or one active membership |
| Membership → User | 1 | Exactly one user per membership |
| Membership → Company | 1 | Exactly one company per membership |
| Company → Membership | 0..* | A company has zero or more members |
| User → Membership (invitedBy) | 0..* | A user may invite zero or more members |

---

## 4. Invariants

1. A `User` may have zero or one active `Membership`.
2. A `Membership` links exactly one `User` to exactly one `Company`.
3. Deleting a `User` cascades to their `Membership` rows.
4. Deleting a `Company` cascades to its `Membership` rows.
5. `auth0Sub` is immutable and maps 1:1 to an Auth0 user.
6. SDK staff have no `Membership` and no `companyId`.
7. A `User` cannot be both SDK staff and a client user simultaneously.

---

## 5. Ownership Rules

### 5.1 Who Creates a Company

| Actor | Action | Condition |
|-------|--------|-----------|
| Client user (self-signup) | Creates a Company + Membership(COMPANY_ADMIN) | Via public signup flow |
| SDK staff (SUPER_ADMIN, ADMIN) | Creates a Company on behalf of a client | Via admin panel or API |

**Rule:** The user who creates a company automatically becomes its first
`COMPANY_ADMIN`. No other user may create a company on behalf of another
entity without explicit SDK staff action.

### 5.2 Who Can Invite Members

| Actor | Can Invite | Scope |
|-------|------------|-------|
| `COMPANY_ADMIN` | Yes | To their own company only |
| `MEMBER` | No | — |
| `VIEWER` | No | — |
| SDK staff | Yes | To any company (platform-level) |

**Rule:** Only `COMPANY_ADMIN` members of a company may invite new members
to that company. SDK staff may invite users to any company.

### 5.3 Who Can Remove Members

| Actor | Can Remove | Scope |
|-------|------------|-------|
| `COMPANY_ADMIN` | Yes | Any member from their own company, except themselves |
| SDK staff | Yes | Any member from any company |

**Rule:** A `COMPANY_ADMIN` may remove any `MEMBER` or `VIEWER` from their
company. A `COMPANY_ADMIN` may not remove another `COMPANY_ADMIN` — this
requires SDK staff intervention or the other admin's voluntary departure.

**Self-removal:** A user may leave a company voluntarily, which deletes
their `Membership`. The last `COMPANY_ADMIN` may not leave unless they
transfer admin role or delete the company.

### 5.4 How SDK Staff Are Provisioned

| Actor | Action |
|-------|--------|
| SUPER_ADMIN | Creates an SDK staff account |
| Auth0 | Sends a "set password" email |
| System | Creates `User` row; no `Membership` created |

**Rule:** SDK staff accounts are created exclusively by `SUPER_ADMIN` or
`ADMIN` via the admin panel or CLI. On first login, a `User` row is created
with `auth0Sub` populated. No `Membership` row is ever created for SDK
staff.

**Staff roles:**
- `SUPER_ADMIN` — full platform access, can manage all staff
- `ADMIN` — platform access, can manage staff below their level
- `STAFF` — limited platform access, read-only or restricted operations

---

## 6. Role Definitions

### 6.1 Client Roles (Membership.role)

| Role | Permissions |
|------|-------------|
| `COMPANY_ADMIN` | Full access within company: invite/remove members, manage projects, view invoices |
| `MEMBER` | Create and edit company resources, cannot manage members |
| `VIEWER` | Read-only access to company resources |

### 6.2 SDK Staff Roles (stored separately, not in Membership)

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Full platform admin: manage all companies, manage all staff, platform settings |
| `ADMIN` | Platform admin: manage companies, manage staff (excluding SUPER_ADMIN) |
| `STAFF` | Read-only access to company data, restricted admin operations |

---

## 7. Cross-Cutting Rules

1. **SDK staff are never in a company.** There is no path by which an SDK
   staff user acquires a `Membership`.
2. **A client user belongs to exactly one company.** The `(userId, companyId)`
   unique constraint enforces this at the database level.
3. **Company creation is the only path to becoming `COMPANY_ADMIN`.** Roles
   cannot be granted retroactively by other users.
4. **Membership is the sole source of company association.** No other table
   links a user to a company.
5. **Deletion is cascading.** Removing a user or company removes all
   associated memberships. Resources owned by the company remain but become
   orphaned; a cleanup process may be defined later.

---

## 8. Open Questions

- Should `SUPER_ADMIN` be able to impersonate a client user for support?
- Can a `COMPANY_ADMIN` promote a `MEMBER` to `COMPANY_ADMIN`?
- What is the maximum number of members per company?
- Should `STAFF` have company-specific permissions, or only platform-wide?
