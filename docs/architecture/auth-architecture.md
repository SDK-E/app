# Authentication Architecture

## 1. Decision

**Use Auth0 for authentication only. Do NOT use Auth0 Organizations.**

Identity (User, Company, Membership) lives in our database. Auth0 handles
authentication (password, social, enterprise SSO) and returns a stable
`sub` claim. Our database is the source of truth for identity and
company associations.

## 2. Rationale

### Why Auth0 (without Organizations)

- **SSO and social login**: Auth0 provides enterprise IdP integration
  (SAML, OIDC) and social providers (Google, Microsoft) out of the box.
- **Security**: Password hashing, breached-password detection, MFA, and
  anomaly detection are handled by Auth0.
- **Session management**: Auth0 manages token issuance, rotation, and
  revocation via the session cookie.
- **Reduced compliance burden**: Auth0 SOC 2 and GDPR obligations reduce
  our surface area for auth-related incidents.

### Why NOT Auth0 Organizations

- **SDK staff are not in any company**: Our identity model has two
  disjoint user categories. SDK staff have no company association.
  Auth0 Organizations assumes every user belongs to an organization,
  which forces an awkward "platform org" workaround.
- **Company is a first-class domain entity**: Company, Membership, and
  roles are core to our domain model. Keeping them in our database
  avoids a dual-source-of-truth problem.
- **Membership semantics differ**: Our Membership entity carries role,
  invitation state, and lifecycle dates. Auth0 Organization membership
  is a simpler concept and would require constant sync with our table.
- **Vendor lock-in**: Auth0 Organizations pricing and limits would
  constrain our B2B pricing and feature roadmap.

### Why NOT pure custom auth

- **Building auth correctly is hard**: Password reset, email
  verification, MFA, breach detection, and session security have
  subtle edge cases.
- **Enterprise customers expect IdP integration**: Many B2B clients
  require SAML or OIDC SSO. Auth0 provides this without custom
  development.

## 3. User Identity Model

### Entities

```
User
  - id (UUID, primary key)
  - auth0Sub (string, unique) — Auth0 user.sub claim
  - email (string, unique, indexed)
  - name (string)
  - avatarUrl (string, nullable)
  - isActive (boolean)
  - lastLoginAt (datetime, nullable)
  - createdAt (datetime)
  - updatedAt (datetime)

Company
  - id (UUID, primary key)
  - name (string)
  - slug (string, unique, indexed)
  - isActive (boolean)
  - createdAt (datetime)
  - updatedAt (datetime)

Membership
  - id (UUID, primary key)
  - userId (FK → User.id)
  - companyId (FK → Company.id)
  - role (enum: COMPANY_ADMIN, MEMBER, VIEWER)
  - invitedBy (FK → User.id, nullable)
  - invitedAt (datetime, nullable)
  - joinedAt (datetime, nullable)
  - createdAt (datetime)
  - updatedAt (datetime)

  Unique constraint: (userId, companyId)
```

### Invariants

- A User may have zero or one active Membership.
- A Membership links exactly one User to exactly one Company.
- Deleting a User cascades to their Memberships.
- Deleting a Company cascades to its Memberships.
- `auth0Sub` is immutable and maps 1:1 to an Auth0 user.

### Identity Attributes

| Attribute | Source | Notes |
|-----------|--------|-------|
| `sub` | Auth0 `sub` claim | Stable, immutable identifier |
| `email` | Auth0 `email` claim | Verified by Auth0 |
| `name` | Auth0 `name` claim | Full display name |
| `avatarUrl` | Auth0 `picture` claim | Nullable |
| `companyAssociation` | `Membership` table | Zero or one active membership |

## 4. Session Shape

The session cookie stores the following claims:

```typescript
interface SessionClaims {
  sub: string;            // Auth0 user.sub
  email: string;          // Verified email
  name: string;           // Display name
  picture?: string;       // Avatar URL (optional)
  companyId?: string;     // Active company ID (null for SDK staff)
  membershipRole?: string; // COMPANY_ADMIN | MEMBER | VIEWER
  isSdkStaff: boolean;    // true if user has no company
  iat: number;            // Issued at (unix timestamp)
  exp: number;            // Expiration (unix timestamp)
}
```

### Session Behavior

- **First login**: User is created in our database if `auth0Sub` is not
  found. `companyId` and `membershipRole` are null.
- **Client user login**: If the user has an active Membership, the
  session includes `companyId` and `membershipRole`.
- **Company switching**: Client users with multiple Memberships may
  switch context. The session reflects the currently active company.
- **SDK staff**: `isSdkStaff` is true when no active Membership exists.
  They access platform admin routes only.

## 5. Registration Flows

### 5.1 SDK Staff Registration

1. **Trigger**: Platform admin creates an SDK staff account via the
   admin panel or CLI.
2. **Auth0 Action**: Auth0 sends a "set password" email to the staff
   member's email address.
3. **Database**: A `User` row is created with `auth0Sub` populated on
   first login. No `Membership` row is created.
4. **Session**: On login, `isSdkStaff` is true. `companyId` and
   `membershipRole` are null.
5. **Access**: SDK staff can access platform admin routes and any
   company in read-only or admin mode based on their SDK staff role
   (SUPER_ADMIN, ADMIN, STAFF).

### 5.2 Client User Registration (New Company)

1. **Trigger**: A prospective client signs up via the public landing
   page or receives a direct invitation link.
2. **Auth0 Signup**: The user authenticates via Auth0 (social, email,
   or enterprise SSO). Auth0 returns `sub`, `email`, `name`.
3. **Company Creation**: A `Company` row is created.
4. **Membership Creation**: A `Membership` row is created with role
   `COMPANY_ADMIN` linking the User to the Company.
5. **Session**: On subsequent logins, `companyId` and
   `membershipRole` are populated.

### 5.3 Client User Invitation (Existing Company)

1. **Trigger**: An existing `COMPANY_ADMIN` invites a new user via the
   client dashboard.
2. **Invitation Record**: A pending `Membership` row is created with
   `invitedBy`, `invitedAt`, and `joinedAt` null.
3. **Auth0 Invitation**: An Auth0 invitation is sent to the invitee's
   email.
4. **Acceptance**: The invitee clicks the link, authenticates via
   Auth0, and the `Membership.joinedAt` is set.
5. **Rejection**: If the invitee declines or the invitation expires,
   the pending Membership is deleted.

### 5.4 SDK Staff Invitation

1. **Trigger**: A SUPER_ADMIN invites an SDK staff member.
2. **Auth0 Invitation**: Auth0 sends a "join" invitation.
3. **Database**: On first login, a `User` row is created. No
   `Membership` is created.
4. **Access**: The staff member accesses platform admin routes.

## 6. Registration Flow Summary

```
New User (no Auth0 account)
    │
    ├── SDK Staff Invite ──► Auth0 invitation ──► User created (no Membership)
    │                                                   │
    │                                                   └── isSdkStaff = true
    │
    └── Client Signup/Invite ──► Auth0 signup ──► Company + Membership(COMPANY_ADMIN)
                                        │
                                        └── isSdkStaff = false, companyId set
```

## 7. Security Considerations

- **Session cookie**: HttpOnly, Secure, SameSite=Strict in production.
- **CSRF protection**: All state-changing routes require CSRF tokens or
  double-submit cookies.
- **Token validation**: Auth0 access tokens are validated on every
  request via JWKS.
- **Company isolation**: Every data query for client users includes a
  `companyId` filter derived from the session.
- **No client-side secrets**: Auth0 configuration is server-only.
- **Production guardrails**: Missing `AUTH0_SECRET` or
  `AUTH0_ISSUER_BASE_URL` in production throws at startup.

## 8. Environment Variables

| Variable | Purpose | Server-only |
|----------|---------|-------------|
| `AUTH0_SECRET` | Session encryption secret | Yes |
| `AUTH0_ISSUER_BASE_URL` | Auth0 domain (e.g., `https://dev-xxx.us.auth0.com`) | Yes |
| `AUTH0_BASE_URL` | Application base URL | Yes |
| `AUTH0_CLIENT_ID` | Auth0 application client ID | No |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret | Yes |

## 9. Future Considerations

- **Multi-company users**: If a user needs to belong to multiple
  companies simultaneously, extend Membership to allow multiple active
  rows per user.
- **Audit logging**: Log authentication events (login, logout, failed
  attempts) for compliance.
- **MFA enforcement**: Require MFA for SDK staff and COMPANY_ADMIN
  roles via Auth0 rules or actions.
