---
name: prisma-next-queries
description: >-
  Write Prisma Next queries for Postgres, SQLite, or Mongo — pick a lane
  (Postgres/SQLite `db.orm.<Model>` + `db.sql.<table>`; Mongo `db.orm.<root>`
  + `db.query.from(...)` pipeline builder), filter / project / sort / paginate,
  eager-load with `.include(...)`, Postgres/SQLite `db.transaction(...)`,
  Postgres/SQLite ORM `.aggregate(...)`, Mongo aggregations via query builder,
  namespace-aware accessors (`db.orm.<ns>.<Model>`, `db.sql.<ns>.<table>`).
  Triggers: query, where, match, select, project, orderBy, take, skip, include,
  lookup, first, all, count, aggregate, group, create, update, delete, upsert,
  returning, transaction, db.close, script teardown, variant, polymorphism,
  drizzle-style, kysely-style. Notes: `.all()` is a Thenable (just `await` it),
  iterators are single-use (`RUNTIME.ITERATOR_CONSUMED`), Postgres `count` is
  `number` while sum/avg/min/max are `number | null`, ranges use chained
  `.where()` or `and(...)` (no `.between(...)`).
---

# Prisma Next — Queries

Edit contract → Prisma handles the rest. This skill covers reading, writing, eager-loading, aggregating, and choosing between the ORM and lower-level query lanes.

## When to Use

- User wants to read, write, update, or delete data.
- User wants to include / eager-load relations.
- User wants to paginate, sort, filter, project.
- User wants to wrap operations in a transaction (`db.transaction(...)` — Postgres and SQLite).
- User wants to aggregate (`count`, `sum`, `avg`, …).
- User mentions: _query, select, where, orderBy, take, skip, include, eager load, first, all, count, aggregate, create, update, delete, upsert, returning, drizzle-style, kysely-style, prisma client_.

## When Not to Use

- User wants to add / change a model → `prisma-next-contract`.
- User wants to wire `db.ts` or add middleware → `prisma-next-runtime`.
- User is querying through a Supabase role-bound db (`asUser` / `asAnon` / `asServiceRole`, RLS, `auth.*` admin reads) → `prisma-next-supabase` for the role-binding surface; everything in this skill then applies to the returned `RoleBoundDb`.
- User wants to debug a query failure (structured error envelope) → `prisma-next-debug`.

## Pick your target

Prisma Next ships **two query lanes per target** on the same `db` value from `src/prisma/db.ts`. Before writing queries, read `db.ts` and load the matching target guide:

| Runtime import in `db.ts`                 | Load                                                                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `@prisma-next/postgres/runtime`           | [`postgres.md`](./postgres.md) — `db.orm.<Model>` + `db.sql.<table>`                                                          |
| `@prisma-next/mongo/runtime`              | [`mongo.md`](./mongo.md) — `db.orm.<root>` + `db.query.from(...)`                                                             |
| `@prisma-next/extension-supabase/runtime` | [`postgres.md`](./postgres.md) — a Supabase `RoleBoundDb` is a Postgres surface; bind a role first via `prisma-next-supabase` |

Both targets share the contract and connection on one `db` value. Reach for the ORM first; drop to the lower-level lane when the ORM can't express the shape. Lane choice is local — one query function picks one lane, not the whole app.

**Do not mix target examples.** Postgres uses PascalCase model roots (`db.orm.User`) and `db.sql.user`; Mongo uses lowercased plural roots (`db.orm.users`) and `db.query.from('users')`. There is no `db.sql` on Mongo and no `db.query` SQL-builder equivalent on Postgres.

## Namespace-aware accessors

When a contract declares more than one namespace (e.g. `public` and `auth`), models and tables are addressed by namespace coordinate:

- **ORM**: `db.orm.<namespace>.<Model>` — e.g. `db.orm.public.User`, `db.orm.auth.User`
- **SQL builder**: `db.sql.<namespace>.<table>` — e.g. `db.sql.public.users`, `db.sql.auth.users`

The flat `db.orm.User` / `db.sql.users` form still works for single-namespace contracts (or when all table names are unique across namespaces). When the same bare name appears in more than one namespace, you must use the namespace coordinate.

See [`postgres.md` § Namespace-aware accessors](./postgres.md#namespace-aware-accessors) for a worked example.

## Consuming the result

On **both Postgres and Mongo**, `.all()` returns an **`AsyncIterableResult<Row>`**, which is _both_ a `PromiseLike<Row[]>` and an `AsyncIterable<Row>`. The canonical idiom is the shortest:

```typescript
const users = await db.orm.User.select("id", "email").all();
```

You do **not** need a `collect()` / `toArray()` helper — `await` is enough.

Two equivalent alternatives exist for cases where they read better:

```typescript
// `.toArray()` returns a genuine `Promise<Row[]>`. Reach for it only when
// something needs a real `Promise` and not merely a thenable.
const rows: Promise<User[]> = db.orm.User.select("id", "email").all().toArray();

// Streaming — process rows one at a time without buffering the whole result.
for await (const user of db.orm.User.select("id", "email").all()) {
  process(user);
}
```

Two single-row shortcuts also exist on the result, in addition to the collection-level `.first()` (which issues `LIMIT 1` on Postgres):

```typescript
const user = await db.orm.User.where({ id }).all().first();
//    ^? Row | null   ← buffers, returns the first row or null. Issues no LIMIT.
const required = await db.orm.User.where({ id }).all().firstOrThrow();
//    ^? Row          ← buffers; throws `RUNTIME.NO_ROWS` if empty.
```

For genuine single-row reads, prefer the _collection_-level `.first()` (which adds `LIMIT 1` to the SQL on Postgres) over `.all().first()` (which fetches all rows and discards the rest).

**The result is single-consumption.** Each `AsyncIterableResult` instance can be consumed once — by `await`, by `.toArray()`, or by `for await`. Trying to consume it a second time throws **`RUNTIME.ITERATOR_CONSUMED`**. Buffer once into a variable and reuse the variable:

```typescript
// Bad — second await throws RUNTIME.ITERATOR_CONSUMED.
const result = db.orm.User.select("id", "email").all();
const a = await result;
const b = await result;

// Good — buffer once, reuse the array.
const users = await db.orm.User.select("id", "email").all();
const a = users;
const b = users;
```

If you've seen `collect(...)` / `toArray(...)` helpers in a codebase wrapping `.all()`, they're vestigial — `await` does the same thing for free. Remove them when you touch the surrounding code.

## Running queries from a short script

When the user is running a one-off `tsx my-script.ts` (not a long-lived server), call `await db.close()` at the end so the process exits cleanly — on Postgres the façade-owned pool keeps Node's event loop alive; on Mongo the façade-owned `MongoClient` does the same.

```typescript
// src/scripts/seed.ts
import { db } from "../prisma/db";

for (const u of users) {
  await db.orm.User.create(u);
}

console.log("Seeded.");
await db.close();
```

## Common Pitfalls (cross-target)

1. **Using Postgres examples on a Mongo project (or vice versa).** Check `db.ts` and load the correct target guide.
2. **Writing a `collect()` / `toArray()` helper to convert `.all()` to an array.** `.all()` returns an `AsyncIterableResult<Row>` which _is_ a `PromiseLike<Row[]>` — `await collection.all()` directly yields `Row[]`.
3. **Consuming an `AsyncIterableResult` twice.** Each result is single-use. The second consumer throws `RUNTIME.ITERATOR_CONSUMED`. Buffer once into a variable and reuse the variable.

Target-specific pitfalls live in the per-target guides.

## What Prisma Next doesn't do yet

- **N:M `.include()` across a junction table.** Workaround: express the N:M traversal through `db.sql.<table>` with an explicit join on the junction table.
- **N:M nested mutations.** Workaround: use explicit two-step create/link.
- **`and` / `or` / `not` combinators in the postgres façade.** Workaround today: import them from `@prisma-next/sql-orm-client` directly.
- **`.orderBy(...)` / `.take(...)` on grouped aggregates (Postgres).** Workarounds: (a) drop to `db.sql.<table>` and write the `GROUP BY` + `ORDER BY` + `LIMIT` directly; (b) live with the JS-side sort/slice if the grouped cardinality is bounded.
- **A raw-SQL lane.** Workaround: model the query through the SQL builder, or file a feature request.
- **TypedSQL (`.sql` files compiled into typed callables).** Workaround: extract a function that returns the built plan and call `db.runtime().execute(plan)` at the call site.
- **`EXPLAIN` / query-plan inspection.** Workaround: connect a `pg.Pool` you control via the runtime's `pg:` binding and issue `EXPLAIN ANALYZE` through it.
- **Streaming large result sets.** Workaround: paginate via `.skip(n).take(m)` for moderate sizes; for very large sets, hold a `pg.Client` from the runtime's `pg:` binding and stream through it directly.
- **Multi-statement batching (Prisma-7-style `db.$transaction([call1, call2])`).** Prisma Next runs each call sequentially. Workaround: wrap atomically-related work in `db.transaction(async (tx) => { ... })` on Postgres.
- **Mongo façade transactions.** Workaround: use the MongoDB driver's session API directly if you control the client binding.
- **Mongo ORM aggregates.** Workaround: express aggregations through `db.query.from(...).group(...).build()` and `runtime.execute(plan)`.
- **Mongo filter helpers on the façade.** Workaround: use object equality `.where({ field: value })` where possible; import from `@prisma-next/mongo-query-ast/execution` only when necessary.
- **Automatic N+1 detection.** Workaround: be deliberate about `.include(...)` in code review; the `lints` middleware catches the more common authoring slips.

## Reference Files

Target-specific reference paths live in the per-target guides:

- **Postgres** — [`postgres.md` § Reference Files](./postgres.md#reference-files)
- **Mongo** — [`mongo.md` § Reference Files](./mongo.md#reference-files)

## Checklist

- [ ] Confirmed the active target from `db.ts` and loaded the matching guide.
- [ ] For multi-namespace contracts, used `db.orm.<ns>.<Model>` / `db.sql.<ns>.<table>` coordinates when the same bare name exists in more than one namespace.
- [ ] Chose the right lane (ORM by default; lower-level builder for shapes the ORM doesn't express).
- [ ] Used `.first()` / `.first({ pk })` (Postgres) or `.where({ ... }).first()` (Mongo) for single-row reads — not `.all()`.
- [ ] Consumed `.all()` with plain `await` (not a `collect()` / `toArray()` helper). Used `for await` only when streaming is actually wanted, and never iterated the same result twice.
- [ ] Did NOT use `db.sql` on a Mongo project or `db.query` where the Postgres SQL builder is meant.
- [ ] Completed the target-specific checklist in the loaded guide.
