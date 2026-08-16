# Identity Model

## Entities and invariants

`User` is the local record for an Auth0 identity. `auth0Sub` is immutable and
unique. Profile fields may be refreshed from Auth0; `isActive` controls local
application access.

`Company` is a client tenant. `Membership` links a User to one Company and
carries the client role. `Membership.userId` is unique, so a client user can
belong to exactly one company.

SDK staff use nullable `User.sdkStaffRole` and never receive Membership rows.
A user cannot be both SDK staff and a client user. The database enforces
membership cardinality; provisioning transactions and principal resolution
enforce the cross-table staff/member invariant.

## Client roles

| Role             | Purpose                                                                            |
| ---------------- | ---------------------------------------------------------------------------------- |
| `OWNER`          | Full company, membership, delivery, and billing control                            |
| `ADMINISTRATOR`  | Company operations and membership administration, excluding ownership-only actions |
| `PROJECT_MEMBER` | Delivery work without company, membership, or billing administration               |
| `BILLING`        | Billing access with minimum company/project context                                |
| `VIEWER`         | Read-only company access                                                           |

Company creation grants the initial `OWNER`. Ownership transfer must preserve
at least one owner when that workflow is implemented.

## SDK staff roles

| Role       | Purpose                                                                   |
| ---------- | ------------------------------------------------------------------------- |
| `ADMIN`    | Identity, company, staff, and authorized cross-company administration     |
| `DELIVERY` | Cross-company delivery operations without staff or finance administration |
| `FINANCE`  | Cross-company billing operations with minimum contextual reads            |

There is no impersonation, company switching, default admin, or production
identity seed in this foundation.
