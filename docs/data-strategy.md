# Data Strategy: Production vs Development

This document defines how development and production data are kept separate,
the rules for each environment, and the safety guarantees that prevent
accidental data leakage or corruption.

## 1. Environment Distinction

Environments are distinguished by `NODE_ENV` and by separate database
connections. These two signals must always agree; never rely on one alone.

| Signal         | Development                                             | Production                                   |
| -------------- | ------------------------------------------------------- | -------------------------------------------- |
| `NODE_ENV`     | `development`                                           | `production`                                 |
| `DATABASE_URL` | Local/dev database (e.g. SQLite file or local Postgres) | Production database (e.g. managed Postgres)  |
| `.env` file    | `.env` or `.env.local` (gitignored)                     | `.env` (injected by platform secret manager) |

### Env var access

All environment variables are read through a single validated access point
(`src/lib/env.ts`). Code must never call `process.env` directly. This ensures
that every variable is validated at startup and that missing values fail loud
and early.

## 2. Production Data Rules (Non-Negotiable)

These rules apply to the production environment at all times. Violation of
any rule is a critical incident.

1. **Never seed production.** Do not run any seed script, migration that
   inserts data, or factory that creates records against the production
   database.
2. **Never insert fake accounts, fake companies, or fake sensitive data into
   production.** This includes demo users, sample invoices, test messages, or
   placeholder documents.
3. **No fallbacks to development defaults.** If a production configuration
   value is missing, the application must fail to start. It must not fall back
   to a development value, a placeholder, or a hardcoded default.
4. **Real data only.** Every record in production must represent a real user,
   company, request, project, milestone, document, message, or invoice.
5. **Production writes are explicit.** Any code path that writes to the
   database must check `NODE_ENV !== 'production'` or require an explicit
   `allowWrite` flag before executing. Default to read-only in production.

## 3. Development Data Strategy

Development uses a dedicated database instance separate from production.
Development data is safe to manipulate, reset, and seed freely.

### Seed data

A seed script (`prisma/seed.ts`) creates sample companies, users, memberships,
requests, projects, milestones, documents, messages, and invoices for
development and testing.

All seed data must be:

- Clearly labeled as synthetic (e.g., email domains like `@example.com`,
  company names like `Acme Corp (Dev)`).
- Realistic in shape but not derived from real users or companies.
- Re-runnable without side effects (idempotent or truncate-first).

### Running seeds

```bash
# Set development database and run seeds
DATABASE_URL="file:./dev.db" npx prisma db seed
```

The seed command must be gated so it refuses to run when `NODE_ENV === 'production'`.

## 4. Startup Validation and Failure Modes

At application startup, `src/lib/env.ts` validates that every required
production variable is present and non-empty. If any required variable is
missing or empty, the application throws an error and exits before accepting
any requests.

### Required production variables

| Variable                | Purpose                    | Failure behavior                                                              |
| ----------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`          | Database connection string | App exits with clear error: `DATABASE_URL is required in production`          |
| `AUTH0_SECRET`          | Session encryption secret  | App exits with clear error: `AUTH0_SECRET is required in production`          |
| `AUTH0_ISSUER_BASE_URL` | Auth0 tenant issuer        | App exits with clear error: `AUTH0_ISSUER_BASE_URL is required in production` |
| `AUTH0_BASE_URL`        | Application base URL       | App exits with clear error: `AUTH0_BASE_URL is required in production`        |
| `NODE_ENV`              | Environment mode           | App exits with clear error: `NODE_ENV must be 'production' in production`     |

### Validation behavior

- Missing or empty variables in **development**: log a warning, allow the
  app to continue so local development is not blocked.
- Missing or empty variables in **production**: throw a descriptive error and
  terminate the process. Do not proceed with a partially configured app.

## 5. Database Isolation

Each environment connects to its own database. Connection strings are never
shared between environments.

| Environment | Isolation method                                                      |
| ----------- | --------------------------------------------------------------------- |
| Development | Local file (`file:./dev.db`) or local Docker Postgres                 |
| Production  | Managed production database, access restricted to application runtime |

### Migration safety

- Migrations may be created and run in development freely.
- Migrations are applied to production only through a reviewed deployment
  pipeline.
- Migration files must never contain hardcoded data inserts. Data insertion is
  the responsibility of seed scripts (development only) or explicit
  application code paths (production only, gated).

## 6. Safety Rules Summary

| Rule                                    | Enforcement mechanism                                                      |
| --------------------------------------- | -------------------------------------------------------------------------- |
| Never seed production                   | Seed script checks `NODE_ENV !== 'production'` and refuses to run          |
| No fake sensitive data in production    | Code review gate; production insert paths require explicit `allowWrite`    |
| No fallbacks to dev defaults            | `src/lib/env.ts` throws on missing production vars                         |
| Separate databases per environment      | Separate `DATABASE_URL` per environment; never hardcode connection strings |
| Real data only in production            | Policy enforced by review and runtime guards                               |
| Missing production config fails clearly | Startup validation with descriptive error messages                         |

## 7. Open Questions

- What is the production database provider and connection pooling strategy?
- Who has direct database access in production, and under what approval process?
- How are production data corrections handled (e.g., fixing bad records)?
- Should there be a separate staging environment with anonymized production
  data, or is development-only data sufficient?
