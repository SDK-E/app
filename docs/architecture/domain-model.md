# Domain Model

## 1. Overview

This document defines the complete domain model for the SDK Enterprises
platform. It describes every entity, its fields, types, relationships,
lifecycle states, and required vs optional constraints.

All entities belong to a `Company` via an explicit `companyId` field (inherited
at creation time). Data isolation is enforced at the query layer.

---

## 2. Entity Relationship Diagram

```
Company 1──* Membership *──1 User
                          |
                          | 1
                          |
                          | *
Request ─────────────────┘
 |
 ├──* Milestone
 |     |
 |     ├──* Document
 |     ├──* Message
 |     └──* Invoice
 |
 ├──* Document
 ├──* Message
 └──* Invoice
```

| Cardinality | Meaning                                   |
| ----------- | ----------------------------------------- |
| `1`         | Exactly one                               |
| `*`         | Zero or more                              |
| `1──*`      | One-to-many                               |
| `*──1`      | Many-to-one                               |
| `1──* ──1`  | Many-to-one through an associative entity |

---

## 3. Entities

### 3.1 User

Shared entity for all users (both client and SDK staff).

| Field         | Type     | Required | Notes                                |
| ------------- | -------- | -------- | ------------------------------------ |
| `id`          | UUID     | Yes      | Primary key                          |
| `auth0Sub`    | string   | Yes      | Auth0 `sub` claim; immutable, unique |
| `email`       | string   | Yes      | Verified by Auth0; unique, indexed   |
| `name`        | string   | Yes      | Display name                         |
| `avatarUrl`   | string   | No       |                                      |
| `isActive`    | boolean  | Yes      | Soft delete flag; default `true`     |
| `lastLoginAt` | datetime | No       |                                      |
| `createdAt`   | datetime | Yes      | Set on creation                      |
| `updatedAt`   | datetime | Yes      | Set on update                        |

**Lifecycle states:**

| State      | Condition                         |
| ---------- | --------------------------------- |
| `ACTIVE`   | `isActive = true`                 |
| `INACTIVE` | `isActive = false` (soft deleted) |

**Invariants:**

- A User may have zero or one `Membership` (if client user).
- A User may have zero or more `Membership` rows as `invitedBy` (if they have invited others).
- SDK staff have no `Membership` and no `companyId`.

---

### 3.2 Company

A client company owned by an `OWNER` member.

| Field       | Type     | Required | Notes                                |
| ----------- | -------- | -------- | ------------------------------------ |
| `id`        | UUID     | Yes      | Primary key                          |
| `name`      | string   | Yes      |                                      |
| `slug`      | string   | Yes      | URL-safe identifier; unique, indexed |
| `isActive`  | boolean  | Yes      | Soft delete flag; default `true`     |
| `createdAt` | datetime | Yes      |                                      |
| `updatedAt` | datetime | Yes      |                                      |

**Lifecycle states:**

| State      | Condition                         |
| ---------- | --------------------------------- |
| `ACTIVE`   | `isActive = true`                 |
| `INACTIVE` | `isActive = false` (soft deleted) |

**Invariants:**

- A Company has zero or more `Membership` rows.
- A Company has zero or more `Request` rows.
- Deleting a Company cascades to its `Membership` rows.
- Deleting a Company does **not** cascade to owned resources; they become orphaned.

---

### 3.3 Membership

Links exactly one `User` to exactly one `Company` with a role.

| Field       | Type              | Required | Notes                                                                   |
| ----------- | ----------------- | -------- | ----------------------------------------------------------------------- |
| `id`        | UUID              | Yes      | Primary key                                                             |
| `userId`    | UUID              | Yes      | FK → `User.id`                                                          |
| `companyId` | UUID              | Yes      | FK → `Company.id`                                                       |
| `role`      | enum `ClientRole` | Yes      | `OWNER` \| `ADMINISTRATOR` \| `PROJECT_MEMBER` \| `BILLING` \| `VIEWER` |
| `invitedBy` | UUID              | No       | FK → `User.id`; user who sent the invitation                            |
| `invitedAt` | datetime          | No       | Set when invitation is sent                                             |
| `joinedAt`  | datetime          | No       | Set when invitee accepts                                                |
| `createdAt` | datetime          | Yes      |                                                                         |
| `updatedAt` | datetime          | Yes      |                                                                         |

**Lifecycle states:**

| State     | Condition                              |
| --------- | -------------------------------------- |
| `PENDING` | `invitedAt` is set, `joinedAt` is null |
| `ACTIVE`  | `joinedAt` is set                      |
| `REMOVED` | Row deleted                            |

**Invariants:**

- Unique constraint: `(userId, companyId)`.
- A User may have zero or one active Membership.
- Deleting a User cascades to their Membership rows.
- Deleting a Company cascades to its Membership rows.

---

### 3.4 Request

A client request submitted to the platform. Requests can spawn Projects or
standalone Documents/Messages/Invoices.

| Field         | Type                 | Required | Notes                                                     |
| ------------- | -------------------- | -------- | --------------------------------------------------------- |
| `id`          | UUID                 | Yes      | Primary key                                               |
| `companyId`   | UUID                 | Yes      | Inherited from creating user's Membership                 |
| `title`       | string               | Yes      |                                                           |
| `description` | string               | Yes      |                                                           |
| `status`      | enum `RequestStatus` | Yes      | See lifecycle states below                                |
| `priority`    | enum `Priority`      | Yes      | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT`; default `MEDIUM` |
| `submittedBy` | UUID                 | Yes      | FK → `User.id`                                            |
| `reviewedBy`  | UUID                 | No       | FK → `User.id`                                            |
| `reviewedAt`  | datetime             | No       |                                                           |
| `closedAt`    | datetime             | No       |                                                           |
| `createdAt`   | datetime             | Yes      |                                                           |
| `updatedAt`   | datetime             | Yes      |                                                           |

**Lifecycle states:**

| State       | Condition                                                      |
| ----------- | -------------------------------------------------------------- |
| `DRAFT`     | Created but not yet submitted                                  |
| `SUBMITTED` | Submitted for review                                           |
| `IN_REVIEW` | Under review by authorized SDK staff or a client administrator |
| `APPROVED`  | Approved; may spawn a Project                                  |
| `REJECTED`  | Rejected with reason                                           |
| `CLOSED`    | Final state; no further changes                                |

**Invariants:**

- `companyId` is inherited from the creating user's Membership; never supplied by client.
- A Request may have zero or more `Project` rows.
- A Request may have zero or more `Document`, `Message`, and `Invoice` rows directly.

---

### 3.5 Project

A project spawned from an approved Request or created directly by a client user.

| Field         | Type                 | Required | Notes                                                       |
| ------------- | -------------------- | -------- | ----------------------------------------------------------- |
| `id`          | UUID                 | Yes      | Primary key                                                 |
| `companyId`   | UUID                 | Yes      | Inherited from creating user's Membership or parent Request |
| `requestId`   | UUID                 | No       | FK → `Request.id`; null if created directly                 |
| `name`        | string               | Yes      |                                                             |
| `description` | string               | Yes      |                                                             |
| `status`      | enum `ProjectStatus` | Yes      | See lifecycle states below                                  |
| `startDate`   | datetime             | No       |                                                             |
| `dueDate`     | datetime             | No       |                                                             |
| `completedAt` | datetime             | No       |                                                             |
| `createdBy`   | UUID                 | Yes      | FK → `User.id`                                              |
| `createdAt`   | datetime             | Yes      |                                                             |
| `updatedAt`   | datetime             | Yes      |                                                             |

**Lifecycle states:**

| State       | Condition                                  |
| ----------- | ------------------------------------------ |
| `PLANNING`  | Initial state; details being defined       |
| `ACTIVE`    | Work in progress                           |
| `ON_HOLD`   | Temporarily paused                         |
| `COMPLETED` | All milestones finished; `completedAt` set |
| `CANCELLED` | Terminated before completion               |

**Invariants:**

- `companyId` is inherited from the creating user's Membership or parent Request.
- A Project may have zero or more `Milestone` rows.
- A Project may have zero or more `Document`, `Message`, and `Invoice` rows directly.
- Deleting a Project cascades to its `Milestone` rows and their children.

---

### 3.6 Milestone

A milestone within a Project.

| Field         | Type                   | Required | Notes                         |
| ------------- | ---------------------- | -------- | ----------------------------- |
| `id`          | UUID                   | Yes      | Primary key                   |
| `projectId`   | UUID                   | Yes      | FK → `Project.id`             |
| `companyId`   | UUID                   | Yes      | Inherited from parent Project |
| `name`        | string                 | Yes      |                               |
| `description` | string                 | Yes      |                               |
| `status`      | enum `MilestoneStatus` | Yes      | See lifecycle states below    |
| `dueDate`     | datetime               | No       |                               |
| `completedAt` | datetime               | No       |                               |
| `createdAt`   | datetime               | Yes      |                               |
| `updatedAt`   | datetime               | Yes      |                               |

**Lifecycle states:**

| State         | Condition                        |
| ------------- | -------------------------------- |
| `PENDING`     | Not yet started                  |
| `IN_PROGRESS` | Work started                     |
| `COMPLETED`   | Finished; `completedAt` set      |
| `OVERDUE`     | Past `dueDate` and not completed |
| `CANCELLED`   | Removed from project             |

**Invariants:**

- `companyId` is inherited from parent Project.
- A Milestone may have zero or more `Document`, `Message`, and `Invoice` rows.
- A Milestone cannot exist without a Project.

---

### 3.7 Document

A file attached to a Project, Milestone, or Request.

| Field         | Type                  | Required | Notes                                                       |
| ------------- | --------------------- | -------- | ----------------------------------------------------------- |
| `id`          | UUID                  | Yes      | Primary key                                                 |
| `companyId`   | UUID                  | Yes      | Inherited from parent Project, Milestone, or Request        |
| `projectId`   | UUID                  | No       | FK → `Project.id`; null if attached to Milestone or Request |
| `milestoneId` | UUID                  | No       | FK → `Milestone.id`; null if attached to Project or Request |
| `requestId`   | UUID                  | No       | FK → `Request.id`; null if attached to Project or Milestone |
| `name`        | string                | Yes      | Original filename                                           |
| `storageKey`  | string                | Yes      | Internal storage path/key                                   |
| `mimeType`    | string                | Yes      | e.g., `application/pdf`                                     |
| `sizeBytes`   | integer               | Yes      | File size in bytes                                          |
| `status`      | enum `DocumentStatus` | Yes      | See lifecycle states below                                  |
| `uploadedBy`  | UUID                  | Yes      | FK → `User.id`                                              |
| `createdAt`   | datetime              | Yes      |                                                             |
| `updatedAt`   | datetime              | Yes      |                                                             |

**Lifecycle states:**

| State      | Condition                     |
| ---------- | ----------------------------- |
| `DRAFT`    | Upload in progress            |
| `UPLOADED` | Fully uploaded and available  |
| `ARCHIVED` | No longer active but retained |
| `DELETED`  | Soft deleted                  |

**Invariants:**

- Exactly one of `projectId`, `milestoneId`, or `requestId` must be set.
- `companyId` is inherited from the parent entity.

---

### 3.8 Message

A text message attached to a Project, Milestone, or Request.

| Field             | Type                 | Required | Notes                                                       |
| ----------------- | -------------------- | -------- | ----------------------------------------------------------- |
| `id`              | UUID                 | Yes      | Primary key                                                 |
| `companyId`       | UUID                 | Yes      | Inherited from parent Project, Milestone, or Request        |
| `projectId`       | UUID                 | No       | FK → `Project.id`; null if attached to Milestone or Request |
| `milestoneId`     | UUID                 | No       | FK → `Milestone.id`; null if attached to Project or Request |
| `requestId`       | UUID                 | No       | FK → `Request.id`; null if attached to Project or Milestone |
| `content`         | string               | Yes      | Message body                                                |
| `authorId`        | UUID                 | Yes      | FK → `User.id`                                              |
| `parentMessageId` | UUID                 | No       | FK → `Message.id`; for threaded replies                     |
| `status`          | enum `MessageStatus` | Yes      | See lifecycle states below                                  |
| `createdAt`       | datetime             | Yes      |                                                             |
| `updatedAt`       | datetime             | Yes      |                                                             |

**Lifecycle states:**

| State      | Condition                             |
| ---------- | ------------------------------------- |
| `SENT`     | Created and visible                   |
| `READ`     | Read by at least one recipient        |
| `ARCHIVED` | Hidden from default view but retained |
| `DELETED`  | Soft deleted                          |

**Invariants:**

- Exactly one of `projectId`, `milestoneId`, or `requestId` must be set.
- `companyId` is inherited from the parent entity.
- `parentMessageId` creates a threaded reply chain; root messages have this field null.

---

### 3.9 Invoice

A financial invoice generated for a Project, Milestone, or Request.

| Field         | Type                 | Required | Notes                                                       |
| ------------- | -------------------- | -------- | ----------------------------------------------------------- |
| `id`          | UUID                 | Yes      | Primary key                                                 |
| `companyId`   | UUID                 | Yes      | Inherited from parent Project, Milestone, or Request        |
| `projectId`   | UUID                 | No       | FK → `Project.id`; null if attached to Milestone or Request |
| `milestoneId` | UUID                 | No       | FK → `Milestone.id`; null if attached to Project or Request |
| `requestId`   | UUID                 | No       | FK → `Request.id`; null if attached to Project or Milestone |
| `amount`      | decimal              | Yes      | Invoice amount                                              |
| `currency`    | string               | Yes      | ISO 4217 code, e.g., `USD`; default `USD`                   |
| `status`      | enum `InvoiceStatus` | Yes      | See lifecycle states below                                  |
| `dueDate`     | datetime             | No       |                                                             |
| `paidAt`      | datetime             | No       |                                                             |
| `createdBy`   | UUID                 | Yes      | FK → `User.id`                                              |
| `createdAt`   | datetime             | Yes      |                                                             |
| `updatedAt`   | datetime             | Yes      |                                                             |

**Lifecycle states:**

| State       | Condition                      |
| ----------- | ------------------------------ |
| `DRAFT`     | Being prepared                 |
| `SENT`      | Sent to client                 |
| `PAID`      | Payment received; `paidAt` set |
| `OVERDUE`   | Past `dueDate` and not paid    |
| `CANCELLED` | Voided before payment          |
| `REFUNDED`  | Payment returned after `PAID`  |

**Invariants:**

- Exactly one of `projectId`, `milestoneId`, or `requestId` must be set.
- `companyId` is inherited from the parent entity.
- Only roles with `invoice:create` may create invoices.

---

## 4. Enums

```typescript
enum ClientRole {
  OWNER = "OWNER",
  ADMINISTRATOR = "ADMINISTRATOR",
  PROJECT_MEMBER = "PROJECT_MEMBER",
  BILLING = "BILLING",
  VIEWER = "VIEWER",
}

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

enum RequestStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CLOSED = "CLOSED",
}

enum ProjectStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

enum MilestoneStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

enum DocumentStatus {
  DRAFT = "DRAFT",
  UPLOADED = "UPLOADED",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
}

enum MessageStatus {
  SENT = "SENT",
  READ = "READ",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
}

enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}
```

---

## 5. Cross-Entity Constraints

### 5.1 Company Isolation

Every data-carrying entity (`Request`, `Project`, `Milestone`, `Document`,
`Message`, `Invoice`) carries a `companyId` field. This field is:

- **Inherited**, never supplied by the client.
- **Immutable** after creation.
- **Mandatory** in every query for client users.

### 5.2 Cascading Deletes

| Parent                                         | Cascade behavior |
| ---------------------------------------------- | ---------------- |
| `Company` → `Membership`                       | Delete           |
| `User` → `Membership`                          | Delete           |
| `Project` → `Milestone`                        | Delete           |
| `Milestone` → `Document`, `Message`, `Invoice` | Delete           |
| `Project` → `Document`, `Message`, `Invoice`   | Delete           |

### 5.3 Parent-Child Exclusivity

`Document`, `Message`, and `Invoice` each have three nullable parent fields
(`projectId`, `milestoneId`, `requestId`). Exactly one must be non-null at all
times. This prevents orphaned attachments and keeps the ownership chain clear.

---

## 6. Base Entity Pattern

All entities extend the following base interface:

```typescript
interface BaseEntity {
  id: string; // UUID, primary key
  createdAt: Date; // Set once on creation
  updatedAt: Date; // Set on every update
}
```

---

## 7. Open Questions

- Should `Milestone` have an explicit `companyId`, or should it always be
  derived from its parent `Project` at query time?
- Should `Document` and `Message` support multiple parents (e.g., attached to
  both a Project and a Request simultaneously)?
- Is `Priority` needed on entities other than `Request`?
- Should `Invoice` support line items, or is a flat amount sufficient for the
  initial release?
