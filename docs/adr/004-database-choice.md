# ADR-004: Database Choice

## Status

Accepted

## Context

The Client Platform is a B2B application with relational data requirements:
companies, users, memberships, requests, projects, milestones, documents,
messages, and invoices. We need a database that supports:

- Relational data with foreign keys and cascading deletes.
- Strong consistency for financial data (invoices).
- Full-text search capabilities (future).
- Managed hosting with connection pooling (production).
- Local development with a simple setup.

## Options Considered

1. **PostgreSQL** — Open-source relational database with strong ACID guarantees.
2. **MySQL** — Open-source relational database, widely supported.
3. **SQLite** — File-based database, simple for development.
4. **MongoDB** — Document database, flexible schema.

## Decision

Use **PostgreSQL** for both development and production.

Development can use a local SQLite file or Docker Postgres, but the production
database is managed PostgreSQL. The Prisma schema is written for PostgreSQL.

### Environment Strategy

| Environment | Database                        | Connection                                         |
| ----------- | ------------------------------- | -------------------------------------------------- |
| Development | Local SQLite or Docker Postgres | `DATABASE_URL=file:./dev.db` or local Postgres     |
| Production  | Managed PostgreSQL              | `DATABASE_URL` injected by platform secret manager |

### Why PostgreSQL

- **ACID guarantees**: Financial data (invoices) requires strong consistency.
- **Relational integrity**: Foreign keys, cascading deletes, and unique
  constraints are essential for the domain model.
- **JSON support**: Allows flexible metadata without leaving the relational model.
- **Full-text search**: Built-in `tsvector` support for future search features.
- **Managed hosting**: All major cloud providers offer managed Postgres with
  automated backups, failover, and connection pooling.
- **Prisma support**: Prisma has excellent PostgreSQL support with migrations.

### Why not MySQL

- PostgreSQL's JSONB and full-text search are more mature.
- Prisma's PostgreSQL provider has better feature parity.
- The team has more experience with PostgreSQL.

### Why not SQLite for production

- No concurrent write support at scale.
- No built-in connection pooling.
- Limited backup and replication options.
- File-based storage is not suitable for managed cloud deployments.

### Why not MongoDB

- The domain model is inherently relational (companies, users, memberships,
  requests, projects, etc.).
- Financial data benefits from ACID transactions.
- No need for schema flexibility at this stage.

## Consequences

- `DATABASE_URL` must be set in all environments.
- Migrations are managed by Prisma and must be reviewed before production
  deployment.
- Connection pooling is handled by the managed Postgres provider or a
  middleware like PgBouncer.
- The Prisma schema uses PostgreSQL-specific types (`@db.VarChar`, `@db.Text`,
  `@db.Decimal`).

## Data Safety Rules

1. **Never seed production.** The seed script checks `NODE_ENV !== 'production'`.
2. **No fake sensitive data in production.**
3. **No fallbacks to development defaults.** Missing `DATABASE_URL` in production
   fails at startup.
4. **Production writes are explicit.** Code paths that write to the database
   require an explicit `allowWrite` flag or `NODE_ENV !== 'production'` check.

## References

- [docs/data-strategy.md](../data-strategy.md)
