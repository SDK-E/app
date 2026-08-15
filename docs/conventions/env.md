# Environment Variables

This document is the single source of truth for all environment variables used
by the Client Platform. **Every variable MUST be documented here** before it is
used. No `.env.example` file is committed; keep this document in sync instead.

## Server-only variables

Server-only variables are read through the validated access point in
`src/lib/env.ts`. Code must **never** read `process.env` directly. Missing or
invalid variables cause the application to fail at startup in production.

| Variable                | Required   | Description |
|-------------------------|------------|-------------|
| `DATABASE_URL`          | yes        | PostgreSQL connection string. Format: `postgresql://user:password@host:port/database`. |
| `AUTH0_SECRET`          | yes        | Auth0 session encryption secret. Minimum 32 characters. Generate with `openssl rand -hex 32`. |
| `AUTH0_ISSUER_BASE_URL` | one of two | Auth0 tenant domain used for token validation, e.g. `https://dev-xxx.us.auth0.com`. Either this or `AUTH0_DOMAIN` must be set. |
| `AUTH0_DOMAIN`          | one of two | Auth0 tenant domain without scheme, e.g. `dev-xxx.us.auth0.com`. Used to derive `AUTH0_ISSUER_BASE_URL` when the latter is unset. |
| `AUTH0_BASE_URL`        | no         | Root URL where the application is hosted, e.g. `http://localhost:3000`. |
| `AUTH0_CLIENT_ID`       | yes        | Auth0 application client ID. |
| `AUTH0_CLIENT_SECRET`   | yes        | Auth0 application client secret. |
| `NODE_ENV`              | yes        | `development` \| `test` \| `production`. |

## Public variables

Variables safe to expose to the browser are exported from `src/lib/env.ts` via
`publicEnv`. Today that is `AUTH0_CLIENT_ID`, used by the Auth0 SDK callback.

## Environment files

- `.env.local` — local overrides (gitignored, **never commit**).
- `.env` / `.env.development.local` — never commit.
- All `.env*` files are gitignored. Vercel-managed values live in the project
  settings and are pulled locally with `vercel pull`.

## Local setup

Create a `.env.local` in the project root with the required values:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/sdkapp
AUTH0_SECRET=replace-with-openssl-rand-hex-32
AUTH0_ISSUER_BASE_URL=https://dev-xxx.us.auth0.com
AUTH0_BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
NODE_ENV=development
```

## Conventions

- Format: `SCREAMING_SNAKE_CASE`.
- Variables exposed to the browser must be prefixed `NEXT_PUBLIC_`. Server-only
  variables must never use that prefix.
- Reference: `src/lib/env.ts` (single access point with zod schema validation).
