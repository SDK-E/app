# Environment Variables

This document is the single source of truth for all environment variables used
by the Client Platform. **Every variable MUST be documented here** before it is
used. No `.env.example` file is committed; keep this document in sync instead.

## Server-only variables

Server-only variables are read through the validated access point in
`src/lib/env.ts`. Code must **never** read `process.env` directly. Missing or
invalid variables cause the application to fail at startup in every environment.

| Variable                | Required   | Description |
|-------------------------|------------|-------------|
| `DATABASE_URL`          | yes        | PostgreSQL connection string. Format: `postgresql://user:password@host:port/database`. |
| `AUTH0_SECRET`          | yes        | Auth0 session encryption secret. Minimum 32 characters. Generate with `openssl rand -hex 32`. |
| `AUTH0_ISSUER_BASE_URL` | one of two | Auth0 tenant domain used for token validation, e.g. `https://dev-xxx.us.auth0.com`. Either this or `AUTH0_DOMAIN` must be set. |
| `AUTH0_DOMAIN`          | one of two | Auth0 tenant domain without scheme, e.g. `dev-xxx.us.auth0.com`. Used to derive `AUTH0_ISSUER_BASE_URL` when the latter is unset. |
| `AUTH0_BASE_URL`        | no         | Root URL where the application is hosted, e.g. `http://localhost:3000`. |
| `AUTH0_CLIENT_ID`       | yes        | Auth0 application client ID. |
| `AUTH0_CLIENT_SECRET`   | yes        | Auth0 application client secret. |
| `RESEND_API_KEY`        | prod-only  | Resend API key for the public "Start a project" enquiry email (`docs/content/start-a-project.md`). Server-only. Required in production for email delivery; its absence must fail loudly, never silently succeed. |
| `MAIL_SMTP_URL`         | no         | Development only: SMTP URL of the local mail sink (`scripts/mail-sink.ts`, smtp-tester) that dev emails are delivered to. Defaults to `smtp://localhost:1025`. The sink auto-starts with `npm run dev`; run standalone with `npm run mail`. Received email is checked via `npm run mail:*` CLI commands or the `maildev` MCP server — no UI. Ignored in production. |
| `MAIL_HTTP_URL`         | no         | Development only: HTTP base URL of the mail sink API. Defaults to `http://localhost:1080`. Read by the mail CLI (`scripts/mail-cli.ts`) and the `maildev` MCP server (`scripts/mail-mcp.ts`). |
| `MAIL_SMTP_PORT`        | no         | Development only: SMTP port the mail sink binds to. Defaults to `1025`. Overrides the sink's listening port (e.g. on a conflict); if changed, `MAIL_SMTP_URL` must point at the new port. |
| `MAIL_HTTP_PORT`        | no         | Development only: HTTP port the mail sink API listens on. Defaults to `1080`. If changed, `MAIL_HTTP_URL` must point at the new port. |
| `NODE_ENV`              | yes        | `development` \| `test` \| `production`. |

## Public variables

Variables safe to expose to the browser are exported from `src/lib/env.ts` via
`publicEnv`. Today that is `AUTH0_CLIENT_ID`, used by the Auth0 SDK callback.
No test or CI fallback credentials are embedded in application code; each
environment must inject its own values.

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
