---
name: prisma-next-migrations
description: Author Prisma Next migrations — choose db update vs migration plan, edit the framework-rendered migration.ts (replace placeholder sentinels with dataTransform closures), recover from MIGRATION.HASH_MISMATCH or PN-MIG-2001 unfilled placeholder. Use for prisma migrate dev, prisma migrate deploy, prisma db push, db update, db update --dry-run, migration plan, migrate, migration new, migration show, db verify, db sign, data migration, this.dataTransform, dataTransform, placeholder, generated migration.ts, edit migration.ts, MIGRATION.HASH_MISMATCH, schema drift.
---

# Prisma Next — Migration Authoring

Edit contract → Prisma plans migration → you fill data transforms. This skill covers the two paths, `migration.ts` authoring, and failure recovery.

## Targets

Migration authoring is first-class for **Postgres** and **Mongo**. Target is set in `prisma-next.config.ts` (from `prisma-next init --target`). Commands do not accept `--target`; use a scoped config.

## When to Use

- User edited contract and wants to apply the change.
- User wants to author a migration with a data transform.
- User wants to run pending migrations against a local DB.
- User hit `MIGRATION.HASH_MISMATCH`, `PN-MIG-2001` (unfilled placeholder), or partially-applied migration.
- User mentions: _migrate, migration, db push, db update, `prisma migrate dev`, `prisma migrate deploy`, drift, hash mismatch, data backfill_.

## When Not to Use

- User wants to know what migrations will run on deploy / manage refs → `prisma-next-migration-review`.
- User wants to edit the contract → `prisma-next-contract`.
- User wants to debug a structured error envelope → `prisma-next-debug`.

## Key Concepts

- **`db update` (quick path).** Resolves emitted contract against live DB and applies. `--dry-run` prints plan. Excludes `data` operations entirely; fails if a data transform is needed. Use only on solo dev DBs.
- **`migration plan` (formal path).** Diffs contract against migration graph head, writes a package under `migrations/app/<YYYYMMDDTHHMM>_<snake_slug>/`. If data transforms are needed, `migration.ts` contains `placeholder(...)` calls to fill.
- **`app/` segment.** Every migration you author lives under `migrations/app/`. Extensions get sibling `migrations/<extension-space-id>/` directories managed by the extension package.
- **Migration package files:** `migration.json` (manifest + `migrationHash`), `ops.json` (canonical operation list; `migrationHash` computed over this), `migration.ts` (framework-rendered TS source you edit then self-emit).
- **Contract snapshots.** `migration.ts` imports bookend contracts from `migrations/snapshots/<hex>/contract.json` + `.d.ts` (content-addressed store).
- **Self-emit.** Run `node migrations/app/<dir>/migration.ts` to regenerate `ops.json` / `migration.json`. Only supported way to update a migration package after edits.
- **`placeholder(slot)`.** Sentinel emitted by planner where a data transform is needed. Calling `placeholder(...)` at emit time throws `PN-MIG-2001`. Replace with a real query-plan closure (Postgres) or fill `dataTransform({ check, run })` sources (Mongo).
- **`this.dataTransform(endContract, name, { check, run })`.** `check` is a rowset query whose presence-of-any-row signals "work remains"; `run` is mutation queries that backfill. Runner wraps `check` as `EXISTS(...)` for precheck and `NOT EXISTS(...)` for postcheck.
- **`pendingPlaceholders`.** Boolean on `migration plan` JSON result. `true` means unfilled placeholders; `migrate` throws `PN-MIG-2001` until you edit and self-emit.
- **`migrationHash`.** Content-addressed identity. `MIGRATION.HASH_MISMATCH` fires when stored hash disagrees with on-disk recomputation.
- **Marker.** Records "DB is at contract hash X for space Y". Postgres: row in `prisma_contract.marker`. Mongo: document in `_prisma_migrations`. `db sign` writes the marker only after schema-verification passes.
- **Apply atomicity.** Postgres: each migration runs inside `BEGIN ... COMMIT`; failure rolls back. Mongo: DDL ops are not transaction-wrapped; runner verifies live schema and advances marker only on verify-pass.
- **Operation classes.** `additive`, `widening`, `data`, `destructive`. No `long-running` class; framework does not emit `CREATE INDEX CONCURRENTLY`.

## `migration.ts` is framework-rendered

Files under `migrations/<space-id>/<timestamp>/migration.ts` are rendered by `prisma-next migration plan` or `migration new`. You edit specific holes (chiefly replacing `placeholder(...)` sentinels or filling `dataTransform` slots), then self-emit.

**Postgres rendered imports** point at `@prisma-next/postgres/migration` (or `@prisma-next/sqlite/migration`).

**Mongo rendered imports** use `@prisma-next/family-mongo/migration` for `Migration` base and `@prisma-next/target-mongo/migration` for operation factories. `MigrationCLI` from `@prisma-next/cli/migration-cli`.

Rules for rendered imports:

- Leave them where they are. Do not rewrite to a different `@prisma-next/<…>` path.
- If you need an additional factory symbol, add it to the existing rendered import line.
- The "user code imports only from `@prisma-next/<target>`" convention is suspended for `migration.ts` only.

## Diagnostic codes

| Code                                                   | Source                             | Move                                                                                                                                            |
| ------------------------------------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `PN-MIG-2001` Unfilled migration placeholder           | `placeholder(...)` at emit         | Open `migration.ts`, replace named `placeholder("<slot>")` with real query closure, self-emit.                                                  |
| `PN-MIG-2002` migration.ts not found                   | Reading migration package          | Recover from VCS, or run `prisma-next migration new`.                                                                                           |
| `PN-MIG-2003` invalid default export                   | Loading `migration.ts`             | Restore planner-emitted scaffold from VCS or re-run `migration plan`.                                                                           |
| `PN-MIG-2005` dataTransform contract mismatch          | Building data-transform query plan | Query builder was instantiated with a contract reference different from `endContract`. Use the `endContract` imported at module scope for both. |
| `MIGRATION.HASH_MISMATCH` Migration package is corrupt | `migrate` or package read          | `ops.json` / `migration.json` edited without self-emitting. Run `node migrations/app/<dir>/migration.ts` to re-emit, then `migrate`.            |
| `PN-RUN-3002` Hash mismatch                            | `db verify`                        | Marker disagrees with contract hash. Either migrate forward, or — if DB is correct and marker is stale — run `db sign`.                         |
| `PN-RUN-3001` Database not signed                      | Any command needing a marker       | Run `prisma-next db init --db <url>` to baseline empty DB, or `db update --db <url>` to apply current contract directly.                        |

## Decision — which path

| Situation                             | Path                                                                                    | Why                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Local dev, schema in flux             | `db update`                                                                             | Fast, interactive, no migration files.          |
| Shared branch with other developers   | `migration plan` + `migrate`                                                            | Replayable, reviewable, content-hashed.         |
| Anything reaching production          | `migration plan` + `migrate`                                                            | Production must run reviewed, hashed migration. |
| Adding a column that needs a backfill | `migration plan` (writes `placeholder`), edit `migration.ts`, self-emit, then `migrate` | `db update` does not author data transforms.    |
| Recovering from drift                 | `db sign` after manual fix, or `migration plan` if PN can plan the fix                  | Depends on which side is right.                 |

## Dev → ship transition (the `db` ref pattern)

```bash
pnpm prisma-next db init --db $DATABASE_URL
pnpm prisma-next contract emit && pnpm prisma-next db update --db $DATABASE_URL
pnpm prisma-next contract emit && pnpm prisma-next migration plan --name add_feature
pnpm prisma-next migrate --db $DATABASE_URL
pnpm prisma-next db verify --db $DATABASE_URL
```

`db` ref is a named pointer at `migrations/app/refs/db.json` — `{ hash, invariants }`. It records which contract hash the project's dev database has been brought up to.

**What `db init` / `db update` write.** When run against the project's default `--db` URL, both implicitly advance the `db` ref. Override with `--advance-ref <name>`. When you pass `--db <non-default-url>`, ref advancement is suppressed unless `--advance-ref` is explicit.

**First `migration plan` after dev iteration.** When the on-disk migration graph is **empty** and the `db` ref points at a non-null hash with a store entry, the planner emits **two** bundles:

1. Baseline: `null → from-hash`
2. Delta: `from-hash → current_contract`

Both land on disk in one invocation. `migrate` then finds a path through the baseline and applies the delta.

**The forgot-the-flag pitfall.** After the graph is **non-empty**, the default `db` ref may point **past the graph tip**. The next implicit-default `migration plan` refuses with `MIGRATION.HASH_NOT_IN_GRAPH` and names reachable refs.

Recovery:

```bash
# Option A — plan from a graph node explicitly
pnpm prisma-next migration plan --from production --name my_change

# Option B — realign the db ref to a graph-node hash, then plan with the default
pnpm prisma-next ref set db <graph-node-hash>
pnpm prisma-next migration plan --name my_change
```

If the `db` ref's pointer is missing and the hash isn't a graph node (`MIGRATION.SNAPSHOT_MISSING`), create it with `ref set db <hash>` or advance it with `db update --advance-ref db`.

**After plain `migrate`.** `migrate` does not implicitly advance the `db` ref. Refresh with `db update` (no-op on DB when already current) or `migrate --advance-ref db`.

**When to switch paths.** Use `db update` while the schema is in flux on a solo dev database. Switch to `migration plan` + `migrate` when the change needs a reviewable, replayable migration — typically before opening a PR or touching any shared environment.

**Graph-node rule (plan time).** Any hash used as a `from` end must already be a node in the on-disk migration graph once the graph is non-empty. The auto-baseline two-bundle emission is the one exception: it applies only on an **empty** graph with a non-null ref-resolved `from` and an available store entry.

**Apply-time complement.** `migrate` reads the live marker before DDL. If the marker hash is not a graph node, the command refuses with `MIGRATION.MARKER_MISMATCH`. `MIGRATION.MARKER_NOT_IN_HISTORY` fires later during the runner's graph walk.

`db` is a **default ref name**, not a reserved one. The framework overwrites it on the next dev cycle.

Canonical detail: [Migration System § Contract resolution through the snapshot store](../../docs/architecture%20docs/subsystems/7.%20Migration%20System.md#contract-resolution-through-the-snapshot-store), [§ `migration plan`](../../docs/architecture%20docs/subsystems/7.%20Migration%20System.md#migration-plan), [§ Recovery affordances](../../docs/architecture%20docs/subsystems/7.%20Migration%20System.md#recovery-affordances), [ADR 218 — Refs with paired contract snapshots](../../docs/architecture%20docs/adrs/ADR%20218%20-%20Refs%20with%20paired%20contract%20snapshots%20and%20universal%20graph-node%20invariant.md) (TML-2629, its paired-snapshot part superseded), [ADR 240 — Contract snapshots live in a content-addressed store](../../docs/architecture%20docs/adrs/ADR%20240%20-%20Contract%20snapshots%20live%20in%20a%20content-addressed%20store.md).

## Workflow — `db update` (quick path)

```bash
pnpm prisma-next contract emit
# Postgres: --db postgresql://...
# Mongo:    --db mongodb://...  (dev scaffolds often need ?replicaSet=rs0)
pnpm prisma-next db update --db $DATABASE_URL --dry-run
pnpm prisma-next db update --db $DATABASE_URL
```

`db update` already verifies schema and advances the marker on success — a follow-up `db verify` is redundant on the happy path. Use `db verify` only when you need a standalone diagnostic.

Inspect JSON output:

```bash
pnpm prisma-next db update --db $DATABASE_URL --json
```

The JSON contains `plan.operations[]` with each `operationClass`, plus `execution.operationsExecuted` and the post-apply `marker.storageHash`. If the command failed because of destructive operations, `meta.destructiveOperations[]` lists exactly what would have been dropped.

## Workflow — `migration plan` + `migrate` (formal path)

```bash
pnpm prisma-next contract emit
pnpm prisma-next migration plan --name <snake_slug>
```

JSON shape signals: `dir` (new package path), `pendingPlaceholders` (`true` if `migration.ts` contains `placeholder(...)`), `operations[].operationClass`, `preview.statements`.

Inspect the package:

```bash
pnpm prisma-next migration show
pnpm prisma-next migration show <dirName-or-migrationHash-prefix>
```

See ordered list across all contract spaces:

```bash
# Online: reads live DB marker as origin
pnpm prisma-next migrate --show --db $DATABASE_URL

# Offline: hypothetical path from any ref or hash
pnpm prisma-next migrate --show --from <hash-or-ref> --to <hash-or-ref>
```

`migrate --show` is read-only. Fill any data transforms, self-emit if you edited `migration.ts`, then:

```bash
pnpm prisma-next migrate --db $DATABASE_URL
```

`migrate` runs without prompting — destructive-op confirmation lives on `db update`, not here. Review destructive ops in the plan output or `migration show` before applying.

## Workflow — Fill a placeholder

The planner detects _that_ a data transform is needed but not _what_ it should do. You fill the transform, then self-emit.

### Postgres

Rendered scaffold:

```typescript
import endContract from "../../snapshots/93f07d1b…c9e1e5a2/contract.json" with { type: "json" };
import { Migration, MigrationCLI, addColumn, placeholder } from "@prisma-next/postgres/migration";

export default class M extends Migration {
  override get operations() {
    return [
      addColumn("public", "user", {
        name: "name",
        typeSql: "text",
        defaultSql: "",
        nullable: true,
      }),
      this.dataTransform(endContract, "backfill user.name", {
        check: () => placeholder("backfill user.name:check"),
        run: () => placeholder("backfill user.name:run"),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
```

Replace both `placeholder(...)` calls with query-plan closures built from `endContract`. The `check` closure must return a **rowset query whose presence of any row signals "work remains"** — conventionally `<table>.select('id').where(<violation predicate>).limit(1)`. Scalar/aggregate shapes silently break the contract: the runner wraps `check` twice (`EXISTS(...)` for precheck, `NOT EXISTS(...)` for postcheck).

Build the query builder against `endContract` so storage hashes line up — using a different contract reference raises `PN-MIG-2005`. Add symbols to the existing `@prisma-next/postgres/migration` import line rather than introducing a second import.

```typescript
import endContract from "../../snapshots/93f07d1b…c9e1e5a2/contract.json" with { type: "json" };
import { Migration, MigrationCLI, addColumn, setNotNull } from "@prisma-next/postgres/migration";
import { db } from "./db";

export default class M extends Migration {
  override get operations() {
    return [
      addColumn("public", "user", {
        name: "name",
        typeSql: "text",
        defaultSql: "",
        nullable: true,
      }),
      this.dataTransform(endContract, "backfill user.name", {
        check: () =>
          db.users
            .select("id")
            .where((f, fns) => fns.eq(f.name, null))
            .limit(1),
        run: () => db.users.update({ name: "" }).where((f, fns) => fns.eq(f.name, null)),
      }),
      setNotNull("public", "user", "name"),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
```

Self-emit:

```bash
node migrations/app/20260515T1200_add_user_name/migration.ts
```

Self-emit regenerates `ops.json` and recomputes `migrationHash` in `migration.json`.

### Mongo

Mongo `dataTransform` operations take `{ check, run }` objects whose `source` / `run` return Mongo query-plan shapes (often `RawAggregateCommand` / `RawUpdateManyCommand` from `@prisma-next/mongo-query-ast/execution`). Every rendered `migration.ts` includes `describe()` bookends.

```typescript
import { MigrationCLI } from "@prisma-next/cli/migration-cli";
import { Migration } from "@prisma-next/family-mongo/migration";
import { createIndex, dataTransform } from "@prisma-next/target-mongo/migration";
import { RawAggregateCommand, RawUpdateManyCommand } from "@prisma-next/mongo-query-ast/execution";

class M extends Migration {
  override describe() {
    return { from: "<hex>", to: "<hex>", labels: ["normalize-names"] };
  }

  override get operations() {
    return [
      createIndex("users", [{ field: "name", direction: 1 }]),
      dataTransform("lowercase-user-name", {
        check: {
          source: () => ({
            collection: "users",
            command: new RawAggregateCommand("users", [
              { $match: { name: { $regex: "[A-Z]" } } },
              { $limit: 1 },
            ]),
            meta: {
              target: "mongo",
              storageHash: "…",
              lane: "mongo-pipeline",
              paramDescriptors: [],
            },
          }),
        },
        run: () => ({
          collection: "users",
          command: new RawUpdateManyCommand("users", { name: { $exists: true } }, [
            { $set: { name: { $toLower: "$name" } } },
          ]),
          meta: { target: "mongo", storageHash: "…", lane: "mongo-raw", paramDescriptors: [] },
        }),
      }),
    ];
  }
}

export default M;
MigrationCLI.run(import.meta.url, M);
```

Self-emit: `node migrations/app/<dir>/migration.ts`.

## Workflow — Author a migration by hand

```bash
pnpm prisma-next migration new --name <snake_slug>
```

Add factory names to the framework-rendered import line. Browse with `--help` and the import list the renderer emitted.

**Postgres factories:** Tables: `createTable`, `dropTable`. Columns: `addColumn`, `dropColumn`, `alterColumnType`, `setNotNull`, `dropNotNull`, `setDefault`, `dropDefault`. Constraints: `addPrimaryKey`, `addForeignKey`, `addUnique`, `dropConstraint`. Indexes: `createIndex`, `dropIndex`. Enums: `createEnumType`, `addEnumValues`, `renameType`, `dropEnumType`. Dependencies: `createSchema`, `createExtension`, `installExtension`. Raw: `rawSql({ id, label, operationClass, target, precheck, execute, postcheck, ... })`. Data transforms: `this.dataTransform(endContract, name, { check, run })`.

**Mongo factories:** Collections: `createCollection`, `dropCollection`, `validatedCollection`, `setValidation`. Indexes: `createIndex`, `dropIndex`. Collection options: `collMod`. Data transforms: `dataTransform(name, { check, run })`.

Self-emit after each edit.

## Workflow — Inspect the live schema

```bash
pnpm prisma-next db schema --db $DATABASE_URL
pnpm prisma-next db schema --db $DATABASE_URL --json > schema.json
```

No built-in filter flag — pipe JSON through `jq` if you only want one table.

## Workflow — Verify contract vs DB (diagnostic)

`db verify` is a **standalone diagnostic** — not a routine step after `db update` or `migrate` on the happy path. Reach for it when you suspect drift or need to prove the DB matches the contract (following manual SQL, restoring from backup, failed `migrate`, `PN-RUN-3002` / `PN-RUN-3001` surfaces).

Modes: default (full verification), `--marker-only`, `--schema-only`, `--strict` (schema elements not present in the contract are an error).

```bash
pnpm prisma-next db verify --db $DATABASE_URL
```

## Workflow — Re-sign the marker

`db sign` rewrites the marker to the current contract hash. Use after a manual repair where the DB is the source of truth and the marker is stale. `db sign` performs a schema-verify first and refuses to sign a DB whose schema disagrees with the contract.

```bash
pnpm prisma-next db sign --db $DATABASE_URL
```

## Workflow — Recover from drift

Drift means `db verify` reports the live DB schema doesn't match what the marker says it should be.

- **The contract is right; the DB is wrong** → run a migration (`db update` for dev, `migration plan` + `migrate` everywhere else).
- **The DB is right; the contract or marker is wrong** → edit the contract to match the DB, emit, then `db sign`.

Diagnose:

```bash
pnpm prisma-next db schema --db $DATABASE_URL --json
pnpm prisma-next db verify --db $DATABASE_URL --json
```

## Workflow — Recover from a partially-applied migration

**Postgres:** each migration applies inside a transaction — failure rolls back and the marker stays at the previous migration's `to` hash.

**Mongo:** DDL is resumable with verify-gated marker advancement; diagnose with `db verify` / `db schema`, fix the failed package's `migration.ts`, self-emit, and re-run `migrate`.

Failures that can leak partial state: Postgres `rawSql(...)` steps outside the transaction wrapper, Mongo DDL that partially applied before verify failed, or external side-effects from a `run` closure.

Diagnose:

```bash
pnpm prisma-next db verify --db $DATABASE_URL --json
pnpm prisma-next db schema --db $DATABASE_URL --json
```

Fix and re-run:

```bash
node migrations/app/<dir>/migration.ts
pnpm prisma-next migrate --db $DATABASE_URL
```

## Workflow — Recover from `MIGRATION.HASH_MISMATCH`

Cause: someone edited `migration.ts` and forgot to self-emit. Remediation:

```bash
node migrations/app/<dir>/migration.ts
pnpm prisma-next migrate --db $DATABASE_URL
```

If self-emit itself fails (the contract has moved on and operations no longer make sense against the migration's end contract), the package is stale. Restore from VCS or delete and re-plan with `migration plan`.

## Workflow — Resolve a destructive-operation prompt (`db update` only)

`db update` stops and asks before dropping columns or tables. The prompt is `db update`-specific — `migrate` does not prompt and runs whatever the migration package contains.

- Answer yes if the data is no longer needed.
- Answer no, then either re-shape the migration via `migration plan` and hand-edit `migration.ts` to preserve the data, or skip the destructive operation by reverting the contract change.

In non-interactive contexts (CI, `--no-interactive`, `--json`), the destructive-op response is returned as a structured error — `meta.destructiveOperations[]` lists what would have been dropped. Re-run with `-y` to auto-accept.

## Common Pitfalls

1. **Using `db update` against shared or production databases.** Never. Use `migration plan` + `migrate`.
2. **Skipping a data transform.** Leaving `placeholder(...)` in `migration.ts` makes the next `migrate` throw `PN-MIG-2001`. Fill every placeholder slot and self-emit.
3. **Editing `ops.json` directly.** Edit `migration.ts`, then self-emit.
4. **Forgetting to self-emit after editing `migration.ts`.** Always self-emit.
5. **Routine `db verify` after a successful `db update` or `migrate`.** Redundant on the happy path.
6. **Aggregate `check` closure in Postgres `this.dataTransform`.** Returning `count(*)` or `bool_and(...)` breaks the precheck/postcheck contract. Use a rowset shape: `select('id').where(<violation>).limit(1)`.
7. **Two contract references in one migration.** Building a query plan against a different contract than the one passed to `this.dataTransform(endContract, ...)` raises `PN-MIG-2005`. Always import `endContract` once at module scope and use the same reference.
8. **Renaming and expecting the planner to detect it (Postgres).** The planner emits a destructive drop+add. Hand-edit `migration.ts` to rewrite the destructive op as a `rawSql({ ... })` that issues `ALTER TABLE ... RENAME COLUMN ...`, or use the two-migration keep / backfill / drop pattern.
9. **Hand-authoring `migration.ts` from a blank file, or rewriting the rendered import line.** Let `prisma-next migration plan` (or `migration new`) render the package, then edit only the holes the framework leaves. On Postgres leave the rendered `@prisma-next/postgres/migration` (or `@prisma-next/sqlite/migration`) import path alone; on Mongo use `@prisma-next/family-mongo/migration` + `@prisma-next/target-mongo/migration` as rendered. Add symbols to the existing factory import line rather than introducing new import paths.

## What Prisma Next doesn't do yet

- **Runtime-apply migrations.** Workaround: run `prisma-next migrate` from your deploy pipeline before the app starts.
- **Seeds-as-first-class.** Workaround: write a TypeScript script that imports your `db` instance.
- **Migration squashing.** They accumulate; for very large histories, manual baseline-and-truncate is the path.
- **In-contract rename hints.** Workaround: hand-edit `migration.ts` to issue a `RENAME COLUMN` via `rawSql(...)`, or use a keep / backfill / drop pattern across two migrations.

## Graph and history commands

- `pnpm prisma-next migration list` — enumerate all on-disk migrations as a graph tree. Supports `--legend`, `--ascii`, `--json`.
- `pnpm prisma-next migration log --db $DATABASE_URL` — flat chronological table of applied migrations. Supports `--ascii` and `--json`.
- `pnpm prisma-next migration graph` — full graph topology. Supports `--legend`, `--ascii`, `--dot`, `--json`.

## `@@control` and DDL scope

Objects whose `@@control` policy excludes them from Prisma Next's managed surface are omitted from planned DDL. Policies: `managed` (Prisma plans and applies DDL), `tolerated` (object may exist, no DDL emitted), `external` (object is expected to exist, no DDL), `observed` (Prisma reads but never writes). Declare `@@control(managed|tolerated|external|observed)` in your schema.

## Telemetry

The CLI collects anonymous usage data by default. To opt out, set `PRISMA_NEXT_DISABLE_TELEMETRY=1` or `DO_NOT_TRACK=1`.

## Checklist

- [ ] Contract emitted (`contract.json` + `contract.d.ts` current).
- [ ] Chose the right path: `db update` (local dev) vs `migration plan` + `migrate` (anything shared).
- [ ] For `migration plan`: ran `migration show` to review before `migrate`.
- [ ] Filled every `placeholder(...)` in `migration.ts` (if any), built against `endContract`.
- [ ] `check` closures are rowset queries, not scalar aggregates.
- [ ] Self-emitted (`node migrations/app/<dir>/migration.ts`) after editing the TS.
- [ ] Ran `migrate` (or `db update`) and saw it complete.
- [ ] Used `db verify` only when diagnosing drift — not as a routine post-apply step.
- [ ] Did NOT use `db update` against a shared or production database.
- [ ] Did NOT edit `ops.json` directly.
- [ ] Did NOT skip a destructive-op prompt without inspecting `meta.destructiveOperations[]`.
