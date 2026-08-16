# ADR-002: Role Model

## Status

Accepted, superseding the original three-role proposal.

## Decision

Use separate role enums for the two disjoint user categories.

- `ClientRole` is stored on Membership: `OWNER`, `ADMINISTRATOR`,
  `PROJECT_MEMBER`, `BILLING`, `VIEWER`.
- `SdkStaffRole` is stored on User: `ADMIN`, `DELIVERY`, `FINANCE`.

Roles map to centralized application Permissions at enforcement time. Direct
per-user permissions are not stored. A user cannot hold an SDK role and a
Membership simultaneously.

This separates tenant authority from platform duties while keeping the model
small enough for the current administration, delivery, and finance needs.
