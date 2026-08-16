# Environment Variables

This document is the single source of truth for all environment variables used
by the Client Platform. **Every variable MUST be documented here** before it is
used. No `.env.example` file is committed; keep this document in sync instead.

## Server-only variables

Server-only variables are read through the validated access point in
`src/lib/env.ts`. Code must **never** read `process.env` directly. Missing or
invalid variables cause the application to fail at startup in every environment.

| Variable                | Required   | Description                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | yes        | PostgreSQL connection string. Format: `postgresql://user:password@host:port/database`. Use `sslmode=verify-full`; the runtime normalizes legacy `prefer`, `require`, and `verify-ca` aliases to that secure behavior.                                                                                                                                                                  |
| `AUTH0_SECRET`          | yes        | Auth0 session encryption secret. Minimum 32 characters. Generate with `openssl rand -hex 32`.                                                                                                                                                                                                                                                                                          |
| `AUTH0_ISSUER_BASE_URL` | one of two | Auth0 tenant domain used for token validation, e.g. `https://dev-xxx.us.auth0.com`. Either this or `AUTH0_DOMAIN` must be set.                                                                                                                                                                                                                                                         |
| `AUTH0_DOMAIN`          | one of two | Auth0 tenant domain without scheme, e.g. `dev-xxx.us.auth0.com`. Used to derive `AUTH0_ISSUER_BASE_URL` when the latter is unset.                                                                                                                                                                                                                                                      |
| `AUTH0_BASE_URL`        | no         | Root URL where the application is hosted, e.g. `http://localhost:3000`.                                                                                                                                                                                                                                                                                                                |
| `AUTH0_CLIENT_ID`       | yes        | Auth0 application client ID.                                                                                                                                                                                                                                                                                                                                                           |
| `AUTH0_CLIENT_SECRET`   | yes        | Auth0 application client secret.                                                                                                                                                                                                                                                                                                                                                       |
| `RESEND_API_KEY`        | prod-only  | Resend API key for project-enquiry notifications and authenticated user invitations. Server-only. Required in production for email delivery; its absence must fail loudly, never silently succeed.                                                                                                                                                                                     |
| `MAIL_SMTP_URL`         | no         | Development only: SMTP URL of the local mail sink (`scripts/mail-sink.ts`, smtp-tester) that enquiry and invitation emails are delivered to. Defaults to `smtp://localhost:1025`. The sink auto-starts with `npm run dev`; run standalone with `npm run mail`. Received email is checked via `npm run mail:*` CLI commands or the `maildev` MCP server — no UI. Ignored in production. |
| `MAIL_HTTP_URL`         | no         | Development only: HTTP base URL of the mail sink API. Defaults to `http://localhost:1080`. Read by the mail CLI (`scripts/mail-cli.ts`) and the `maildev` MCP server (`scripts/mail-mcp.ts`).                                                                                                                                                                                          |
| `MAIL_SMTP_PORT`        | no         | Development only: SMTP port the mail sink binds to. Defaults to `1025`. Overrides the sink's listening port (e.g. on a conflict); if changed, `MAIL_SMTP_URL` must point at the new port.                                                                                                                                                                                              |
| `MAIL_HTTP_PORT`        | no         | Development only: HTTP port the mail sink API listens on. Defaults to `1080`. If changed, `MAIL_HTTP_URL` must point at the new port.                                                                                                                                                                                                                                                  |
| `NODE_ENV`              | yes        | `development` \| `test` \| `production`.                                                                                                                                                                                                                                                                                                                                               |

## Public variables

No environment variables are currently exposed to browser code. Auth0 client
configuration remains server-side. No test or CI fallback credentials are
embedded in application code; each runtime environment injects its own values.

## Environment files

- `.env.local` — local overrides (gitignored, **never commit**).
- `.env` / `.env.development.local` — never commit.
- All `.env*` files are gitignored. Vercel-managed values live in the project
  settings and are pulled locally with `vercel pull`.

## Local setup

Local development uses a local Prisma dev server — never the production database.

Start the local Postgres server (detached, runs in the background):

```bash
npx prisma dev --detach -n app -P 5432
```

Check the running server and its actual DB port (it may not be `5432` if the port
was busy when you started it):

```bash
npx prisma dev ls
```

Manage the local server lifecycle:

```bash
npx prisma dev ls        # list servers (name, status, URLs)
npx prisma dev stop      # stop the current project's server
npx prisma dev start     # restart a stopped server
```

Then create the `app` database on that server (once):

```bash
DATABASE_URL="<tcp URL from prisma dev ls>" npx prisma db execute --stdin <<'SQL'
CREATE DATABASE app;
SQL
```

Create a `.env.local` in the project root with the required values. Point all
three database variables at the local server and the `app` database — replace
`<port>` with the value from `npx prisma dev ls`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:<port>/app?sslmode=disable
POSTGRES_URL=postgres://postgres:postgres@localhost:<port>/app?sslmode=disable
PRISMA_DATABASE_URL=postgres://postgres:postgres@localhost:<port>/app?sslmode=disable
AUTH0_SECRET=replace-with-openssl-rand-hex-32
AUTH0_ISSUER_BASE_URL=https://dev-xxx.us.auth0.com
AUTH0_BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
NODE_ENV=development
```

Apply migrations to the local database:

```bash
DATABASE_URL="$(node -e "require('dotenv').config({path:'.env.local'});process.stdout.write(process.env.DATABASE_URL)")" npx prisma migrate deploy
```

**Do not** point `DATABASE_URL` (or `POSTGRES_URL` / `PRISMA_DATABASE_URL`) at
the production database (`db.prisma.io`) in `.env.local`. Vercel CLI's
`vercel env pull` writes the production connection string — if you use it, reset
the three database variables back to the local server before running anything
destructive (e.g. `prisma migrate reset`).

## Conventions

- Format: `SCREAMING_SNAKE_CASE`.
- Variables exposed to the browser must be prefixed `NEXT_PUBLIC_`. Server-only
  variables must never use that prefix.
- Reference: `src/lib/env.ts` (single access point with zod schema validation).
