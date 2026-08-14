# ADR-001: Authentication Provider Strategy

## Status

Accepted

## Context

The Client Platform is a B2B application where:

- SDK staff manage the platform and access all companies.
- Client users belong to exactly one company via a Membership.
- Companies are first-class domain entities with their own data.
- Enterprise clients require SSO (SAML/OIDC) and social login.

The project has `@auth0/nextjs-auth0` installed but no configuration or
user model. We must choose an authentication strategy that supports both
user categories without creating a dual-source-of-truth problem.

## Options Considered

1. **Auth0 with Organizations**
2. **Auth0 without Organizations (hybrid)**
3. **Pure custom auth (credentials + social)**

## Decision

Use **Auth0 for authentication only**. Identity (User, Company,
Membership) lives in our database. Auth0 returns a stable `sub` claim
that maps to our `User.auth0Sub` field.

## Rationale

- Auth0 Organizations assumes every user belongs to an org, which
  conflicts with SDK staff having no company.
- Company and Membership are core domain entities; keeping them in our
  database avoids sync complexity and vendor lock-in.
- Auth0 provides enterprise SSO, social login, MFA, and security
  features that would be expensive and risky to rebuild.
- A hybrid approach gives us control over the data model while
  leveraging Auth0's auth infrastructure.

## Consequences

- `User.auth0Sub` becomes the bridge between Auth0 and our database.
- Session includes `companyId` and `membershipRole` for client users,
  `isSdkStaff` for SDK staff.
- Every data query for client users must include a `companyId` filter.
- Auth0 Actions or Rules will be used to enforce MFA and role-based
  policies at the identity provider level.

## References

- [Auth Architecture Document](../architecture/auth-architecture.md)
