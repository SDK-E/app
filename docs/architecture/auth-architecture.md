# Authentication Architecture

## Decision

Auth0 owns authentication: login, logout, identity proofing, sessions,
password recovery, email verification, MFA, and provider integrations. The
application never stores passwords and does not use Auth0 Organizations.

PostgreSQL owns application identity and authorization. Auth0's immutable
`user.sub` maps one-to-one to `User.auth0Sub`; email is profile data and is
never used to link identities.

## Request flow

1. Auth0 validates the session and supplies authentication claims.
2. `getCurrentPrincipal()` resolves `sub` against PostgreSQL on the server.
3. A missing local user is created as unassigned with no application access.
4. The resolver returns exactly one principal kind: `unassigned`, `client`, or
   `sdk-staff`.
5. Server layouts, actions, and route handlers enforce permissions and company
   scope from that principal.

Roles, permissions, and company IDs are not copied into or trusted from the
Auth0 session. Database changes therefore apply on the next request.

## Identity states

- **Unassigned:** authenticated and locally recorded, but no portal access.
- **Client:** exactly one active Membership and no SDK staff role.
- **SDK staff:** one nullable `sdkStaffRole` value and no Membership.
- **Inactive:** authentication may succeed, but application access is denied.

The application rejects a user that is both SDK staff and a company member.
Provisioning must use the transaction helpers in `src/lib/identity-management.ts`.

## Security boundaries

- `src/proxy.ts` performs coarse anonymous-route protection only.
- Protected layouts resolve the local principal again.
- Resource operations call `requirePermission` and tenant-scoping helpers.
- Client company scope always comes from Membership, never request input.
- SDK staff must specify a target company for company-owned resources.
- Required configuration is zod-validated with no fallback secrets.
