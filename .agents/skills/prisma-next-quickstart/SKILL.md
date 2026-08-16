---
name: prisma-next-quickstart
description: >-
  Adopt Prisma Next into a new project, onto an existing database, or as the
  first move after a bootstrap tool dropped you into a scaffold. Use for "what
  can I do with Prisma Next", "what can I do next with Prisma", "where do I
  start", "what should I do first", "just ran createprisma", "createprisma",
  "npx createprisma", "npx create-prisma", "first steps", "first query", "I
  have a scaffolded Prisma Next project what now"; for `pnpm dlx prisma-next
  init` greenfield setup; and for `prisma-next contract infer` + `db sign`
  against an existing database. Also covers the connect-write-read first-arc
  orientation, the day-to-day commands (`contract emit`, `db init`, `db
  update`, `migration plan`, `migrate`, `db schema`, `db verify`), and
  routing to `prisma-next-contract` / `prisma-next-queries` /
  `prisma-next-runtime` for the next move. Flags: --target, --authoring,
  --schema-path, --probe-db, --output.
---

# Prisma Next — Quickstart (Adoption)

Edit contract → Prisma handles the rest. Three paths, all converging on **connect → write → read**. Schema editing comes _after_ the first arc.

## Paths

- **First-touch orientation** — PN project already exists (scaffolded by `createprisma`, `prisma-next init`, or a teammate). User asks _"where do I start?"_ / _"what's next?"_. Goal: anchor on the contract, get one round-trip working, let further commands surface organically.
- **Greenfield** — new project, fresh database. User runs `prisma-next init`.
- **Brownfield-DB** — existing database, no contract yet. Infer with `contract infer`, sign with `db sign`, then write queries.

This skill does **not** cover migrating from another ORM (Drizzle, Prisma 6/7, Sequelize, TypeORM, Kysely, Knex, raw drivers). Those are separately-installable skills.

## When to Use

- User asks _"what can I do with Prisma Next?"_, _"what can I do next with Prisma?"_, _"where do I start?"_, _"what should I do first?"_ — and a PN project already exists on disk.
- User just ran `createprisma` (or equivalent scaffold tool) and is asking what to do next.
- User is starting a new project and wants to use Prisma Next.
- User has an existing database (no PN contract) and wants to introduce PN.
- User typed _"prisma-next init"_, _"get started with PN"_, _"set up PN"_, _"how do I scaffold a project"_.
- User says _"I have an existing Postgres/Mongo, how do I start using PN?"_.

## When Not to Use

- User already has a PN project and wants to add a model → `prisma-next-contract`.
- User wants to migrate FROM a specific ORM → install `@prisma-next/migrate-from-<orm>-skill` (separate).
- User wants to wire `db.ts` in a project that already has a contract → `prisma-next-runtime`.
- User wants to integrate Prisma Next with a build tool (Vite plugin, Next.js, …) → `prisma-next-build`.

## Key Concepts

- **Contract**: the data model. Authored as `contract.prisma` (PSL) or `contract.ts` (TypeScript builder). Emits `contract.json` (runtime IR) + `contract.d.ts` (types).
- **Target**: the backing store (`postgres` or `mongodb`). Picked at `init` time.
- **Authoring mode**: `psl` (default) or `typescript` (programmatic builder; pairs with Vite plugin from `prisma-next-build` for auto-emit).
- **Façade packages.** User code imports from façade subpaths (`@prisma-next/postgres/config`, `@prisma-next/postgres/runtime`, etc.). Never reach past it.
- **`db.ts`**: the runtime entry point at `src/prisma/db.ts`. The rest of `src/` imports from here.
- **Marker**: a row in your database that records the contract hash. Created by `db init` (greenfield) or `db sign` (brownfield).

### Canonical on-disk layout

```text
<app-root>/
├── prisma-next.config.ts             ← project config at repo root
├── src/
│   └── prisma/
│       ├── contract.prisma           ← (or contract.ts) — schema source you author
│       ├── contract.json             ← emitted by `contract emit` — do not edit
│       ├── contract.d.ts             ← emitted by `contract emit` — do not edit
│       └── db.ts                     ← runtime entry
└── migrations/
    ├── snapshots/                    ← content-addressed contract store
    │   └── <hex>/
    │       ├── contract.json
    │       └── contract.d.ts
    └── app/                          ← created on first `migration plan` / `db init`
        ├── refs/head.json
        └── <timestamp>_<slug>/
            ├── migration.json
            ├── ops.json
            └── migration.ts
```

- **`src/prisma/`** is the home for the contract — source + emitted artefacts + `db.ts`.
- **`migrations/app/`** is the consuming application's space-id. Extensions get sibling directories; you don't write into those.
- **`prisma-next.config.ts`** lives at the repo root.

> **Heads up — `prisma-next init` currently scaffolds the wrong layout.** It writes `prisma/contract.{prisma,ts}` and `prisma/db.ts` at the repo root instead of under `src/prisma/`. Tracked as [TML-2532](https://linear.app/prisma-company/issue/TML-2532). Until fixed, either pass `--schema-path src/prisma/contract.prisma` to `init`, or move the scaffolded `prisma/` directory into `src/prisma/` after `init` and update the config.

## Your first arc — connect, write, read

All three paths converge here. Once scaffolded and the database is reachable, the first move is **always** the same: connect, write a row, read it back, against whatever model the contract already declares. Don't touch the contract source on this first move.

```typescript
// src/first-arc.ts
import "dotenv/config";
import { db } from "./prisma/db";

await db.orm.User.create({ email: "alice@example.com" });
const users = await db.orm.User.select("id", "email").all();
console.log(users);
```

If that prints `[{ id: 1, email: 'alice@example.com' }]`, the project is wired end-to-end.

Prerequisites:

- `prisma-next.config.ts` exists at repo root and declares target + contract source.
- Contract source exists at `src/prisma/contract.{prisma,ts}`.
- `src/prisma/db.ts` exists and instantiates the runtime.
- `DATABASE_URL` is set in `.env`.
- The database has been initialised (`db init`) or marker-signed (`db sign`).

**Mongo target:** `db.orm` is keyed by collection storage name — `db.orm.users.create(...)` / `db.orm.users.select('id', 'email').all()`, not `db.orm.User`.

## Workflow — First-touch orientation

Triggers: _"what can I do with Prisma Next?"_, _"where do I start?"_, _"I just ran createprisma"_, or any close variant — paired with a PN project already on disk.

### Step 1 — Read the project, name the contract

Before saying anything specific, read `prisma-next-config.ts`, the contract source, `db.ts`, and `.env` / `.env.example`. Then **say the contract path back to the user, with its role attached**: _"Your contract is at `<path>`. It describes your app — query types, migrations, and runtime types all flow from it. Let's get your app connected to a database."_

### Step 2 — Get connected and round-tripping

- **Everything already wired.** Go straight to writing and reading a row.
- **`DATABASE_URL` not set.** Have the user set it in `.env`, then `pnpm prisma-next db init` to apply the current contract and write the marker row.
- **Database is connectable but not contract-aware.** Run `pnpm prisma-next db init`.
- **Contract is empty.** Add one model with two fields, `contract emit`, then `db init`.

### Step 3 — Round-trip a row

Run the snippet from _Your first arc_ above against whatever model the contract declares. When it prints the row back, the user has crossed from _"I have a project"_ to _"my app runs against my database"_.

### Step 4 — Hand off to the next move

Route to:

- More queries → `prisma-next-queries`.
- Add a model, change a field, add a relation → `prisma-next-contract`.
- Middleware, environment config, multiple targets → `prisma-next-runtime`.
- Vite / Next.js / dev-server integration → `prisma-next-build`.

### Anti-patterns on this path

- **Leading with a feature tour or capability inventory.** Get them doing it.
- **Listing commands before any have been used.** Surface them when the move requires them.
- **Diving into migration concepts before one query has run.**
- **Adding several models in one go.** Add one, get one query green, then iterate.
- **Walking the user through `prisma-next.config.ts` keys.** The scaffold's defaults are correct; revisit when the user needs to change something.
- **Skipping the contract framing.** Even one line anchors the user.

## Workflow — Greenfield

```bash
mkdir my-app && cd my-app
pnpm init                                          # if no package.json yet
pnpm dlx prisma-next init                          # interactive
# or non-interactive (CI / agent runs):
pnpm dlx prisma-next init --yes --target postgres --authoring psl
```

> **Telemetry is opt-out.** The CLI collects anonymous usage data by default. Every command prints a one-time notice to stderr on first use. Opt out with `DO_NOT_TRACK=1` or `PRISMA_NEXT_DISABLE_TELEMETRY=1`, or by running `prisma-next telemetry disable`. Run `prisma-next telemetry status` to see what's currently in effect.

Key flags:

- `--target <db>` — `postgres` or `mongodb`.
- `--authoring <style>` — `psl` or `typescript`.
- `--schema-path <path>` — defaults to `prisma/contract.prisma` (or `prisma/contract.ts`). **Pass `--schema-path src/prisma/contract.prisma`** to scaffold into the canonical `src/prisma/` location directly.
- `--force` — overwrite an existing scaffold without prompting.
- `--write-env` — also write `.env` (default writes only `.env.example`).
- `--probe-db` — connect to `DATABASE_URL` once and check the server version.
- `--strict-probe` — fail init if the probe fails.
- `--no-install` — skip dependency install + initial contract emit.
- `--no-skill` — skip Prisma Next skills installation.

`init` writes: `prisma-next.config.ts`, contract source, `db.ts`, `.env.example`, updates `package.json` + `tsconfig.json`, installs deps, runs `prisma-next contract emit` once, registers skills.

**If you took `init`'s default and ended up with a top-level `prisma/` directory:**

```bash
mkdir -p src && mv prisma src/prisma
# Then update prisma-next.config.ts so `contract` reads
# 'src/prisma/contract.prisma' (or .ts) instead of 'prisma/contract.prisma'.
pnpm prisma-next contract emit   # re-emits under src/prisma/
```

Do this before running `db init`.

After init succeeds:

1. Set `DATABASE_URL` in `.env`.
2. Initialise the database: `pnpm prisma-next db init`. Creates tables, indexes, constraints, writes the marker row.
3. Run the first arc snippet against the starter model.

## Workflow — Brownfield-DB (existing database, no contract)

```bash
mkdir my-app && cd my-app
pnpm init
pnpm dlx prisma-next init --yes --target postgres --authoring psl
```

Then, with `DATABASE_URL` set in `.env`:

```bash
pnpm prisma-next contract infer --db "$DATABASE_URL" --output src/prisma/contract.prisma
```

Read the inferred PSL. Symptoms a re-author pass is needed: tables PN couldn't categorise, wrong type guesses, missing `@unique` / `@index` hints, field names you'd prefer to alias.

Then re-emit and sign:

```bash
pnpm prisma-next contract emit
pnpm prisma-next db sign
pnpm prisma-next db verify   # confirms the DB matches the contract
```

Run the first arc snippet using one of your existing tables.

## Commands you'll use day-to-day

| What you want to do                                                         | Command                                           | Deeper skill             |
| --------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------ |
| Apply the current contract to the DB the first time                         | `prisma-next db init`                             | this skill               |
| Re-emit `contract.json` + `contract.d.ts` after editing the contract source | `prisma-next contract emit`                       | `prisma-next-contract`   |
| Quick dev-only schema sync (no migration history kept)                      | `prisma-next db update`                           | `prisma-next-migrations` |
| Plan a migration from a contract diff                                       | `prisma-next migration plan --name <slug>`        | `prisma-next-migrations` |
| Apply pending migrations                                                    | `prisma-next migrate`                             | `prisma-next-migrations` |
| Inspect the live database                                                   | `prisma-next db schema`                           | `prisma-next-debug`      |
| Confirm the DB matches the contract (drift check)                           | `prisma-next db verify`                           | `prisma-next-debug`      |
| Bring an existing DB into a PN contract                                     | `prisma-next contract infer --db "$DATABASE_URL"` | this skill (brownfield)  |
| Decode a structured error envelope                                          | (read the `code` / `why` / `fix` fields)          | `prisma-next-debug`      |
| Report a bug or request a feature                                           | (file via the feedback skill)                     | `prisma-next-feedback`   |

## Decision — PSL vs TypeScript authoring

- **PSL** (`contract.prisma`) — the default. Concise, declarative. Recommended for most projects.
- **TypeScript** (`contract.ts`) — a programmatic builder. Use when the contract is genuinely computed, when you reuse contract fragments across files, or when an extension requires constructs PSL doesn't yet express. Pairs with the Vite plugin from `prisma-next-build` for auto-emit on save.

Switch authoring later by re-running `prisma-next init` in the same directory. Existing contract content is not automatically translated — you'll re-author by hand.

## Common Pitfalls

1. **Running `prisma-next init <project-name>` with a positional argument.** `init` operates on the current working directory; there is no positional project-name argument.
2. **`init` doesn't connect to your database.** It only scaffolds files and installs dependencies. You connect with `db init` / `db update` / `migrate`.
3. **Treating inferred PSL as the final contract.** `contract infer` produces a starting point. Don't `db sign` against a contract you haven't read.
4. **Forgetting to emit after editing the contract.** `contract.json` / `contract.d.ts` are stale until you run `contract emit`.
5. **Setting `DATABASE_URL` in `prisma-next.config.ts` instead of `.env`.** The config reads `.env` automatically via `dotenv/config`. Hardcoding leaks credentials.
6. **Hand-editing `contract.json` or `contract.d.ts`.** They're emitted artefacts; the next `contract emit` overwrites your changes. Edit the source instead.
7. **Using `--out` for `contract infer`.** The flag is `--output`.

## What Prisma Next doesn't do yet

- **Migration from another ORM.** Workaround: install the matching `@prisma-next/migrate-from-<orm>-skill` if one exists, or treat the source as a brownfield database and `contract infer` from it.
- **`prisma db push`-style production sync.** `db update` is the quick development path; for production, use migrations.
- **Studio / GUI database browser.** Use `prisma-next db schema` for a CLI tree-style summary.

## Checklist

- [ ] Confirmed which path applies (first-touch orientation / greenfield / brownfield) before proposing commands.
- [ ] **First-touch orientation:** named the contract path back to the user and framed its role before proposing any commands.
- [ ] **All paths:** brought the project to the first-arc prerequisites before writing application code.
- [ ] **All paths:** ran the first arc — one `create` + one `select` — and got the round-trip working green.
- [ ] **All paths:** did not edit the contract source as part of the first arc.
- [ ] **All paths:** did not lead with a feature tour or recital of CLI commands.
- [ ] Confirmed the user's target (`postgres` / `mongodb`) and authoring mode (`psl` / `typescript`).
- [ ] **First-touch orientation:** read `prisma-next.config.ts`, the contract source, `db.ts`, and `.env` before proposing anything.
- [ ] **Greenfield path:** ran `prisma-next init` from the project directory — no positional project-name argument.
- [ ] **All paths:** the project ended up in the canonical `src/prisma/` layout — including moving the scaffolded directory out of a top-level `prisma/` if `init` produced one.
- [ ] **Brownfield path:** ran `contract infer --db "$DATABASE_URL" --output src/prisma/contract.prisma`, reviewed the result, then `contract emit` + `db sign`.
- [ ] Set `DATABASE_URL` in `.env` and confirmed the value is reachable.
- [ ] Initialised the DB (`db init` greenfield / first-touch) or signed the marker (`db sign` brownfield).
- [ ] Did NOT hand-edit `contract.json` or `contract.d.ts`.
- [ ] Did NOT set `DATABASE_URL` in `prisma-next.config.ts`.
