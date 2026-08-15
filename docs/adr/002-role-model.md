# ADR-002: Role Model

## Status

Accepted

## Context

The Client Platform has two distinct user populations that require different
access patterns:

- **Client users** — belong to exactly one company and need company-scoped
  permissions.
- **SDK staff** — operate at the platform level and need cross-company access.

We need a role model that:
1. Enforces company isolation for client users.
2. Allows fine-grained platform-level access for SDK staff.
3. Prevents dual-role conflicts (a user should never be both).
4. Maps cleanly to our permission enforcement strategy (middleware, server
   actions, API routes).

## Options Considered

1. **Single flat role enum** — One enum with all roles (`COMPANY_ADMIN`,
   `MEMBER`, `VIEWER`, `SUPER_ADMIN`, `ADMIN`, `STAFF`).
2. **Dual role enums with Membership** — `ClientRole` on `Membership` for
   company members; `SdkStaffRole` on `User` for platform staff.
3. **Permission-based only** — No roles; assign permissions directly to users.

## Decision

Use **dual role enums** with `ClientRole` on `Membership` and `SdkStaffRole`
on `User`. No user can hold both roles simultaneously.

```typescript
enum ClientRole {
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

enum SdkStaffRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}
```

### Client Roles (stored in Membership)

| Role | Permissions |
|------|-------------|
| `COMPANY_ADMIN` | Full access within company |
| `MEMBER` | Create and edit resources |
| `VIEWER` | Read-only |

### SDK Staff Roles (stored on User)

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Full platform access |
| `ADMIN` | Platform access excluding SUPER_ADMIN management |
| `STAFF` | Read-only platform access |

## Rationale

- **Separation of concerns**: Client roles govern company membership; SDK staff
  roles govern platform access. Mixing them in a single enum creates confusion
  and makes permission checks harder to reason about.
- **Data model alignment**: `ClientRole` lives on `Membership` because it is
  scoped to a company. `SdkStaffRole` lives on `User` because SDK staff have no
  company.
- **Permission clarity**: A single `Permission` enum covers all operations.
  Roles are mapped to permissions at enforcement time, not stored on the user.
- **Enforcement simplicity**: Server actions and API routes check `isSdkStaff`
  first, then branch to either client or staff permission logic.

## Consequences

- `Membership` table carries `role` (ClientRole). `User` table must carry
  `sdkStaffRole` (SdkStaffRole) — **this field is not yet in the Prisma schema**.
- The session must include both `membershipRole` and `sdkStaffRole`, plus
  `isSdkStaff` to disambiguate.
- Type system must define two enums, not one. The current `UserRole` type in
  `src/types/index.ts` is a placeholder that does not match this model.
- Middleware and auth guards must be updated to check both role enums.

## Implementation Notes

- Add `SdkStaffRole` enum to `prisma/schema.prisma`.
- Add `sdkStaffRole` field to `User` model.
- Update `src/types/index.ts` to define `ClientRole` and `SdkStaffRole`.
- Update middleware and auth guards to use the correct role enums.

## Open Questions

- Should SDK staff roles be stored in a separate table to allow historical
  audit of role changes?
- Should a user be able to transition from SDK staff to client user (or vice
  versa), or is the boundary permanent?

## References

- [docs/architecture/rbac.md](../architecture/rbac.md)
- [docs/architecture/identity-model.md](../architecture/identity-model.md)
