# AGENTS.md

## Tech stack

- Next.js 16.3.1 — App Router only (no Pages Router, `pages/`, `getServerSideProps`)
- React 19.2.8 + TypeScript 5 (`strict: true`)
- Tailwind CSS v4 — styling only
- Prisma 7.9.1 (Postgres) + zod 4.4.3 — data access / validation
- @auth0/nextjs-auth0 4.26.0 — authentication
- Vitest 4 + Testing Library — unit tests; Playwright — E2E via MCP
- Path alias `@/*` → `./src/*`

## Coding standards

**Use:** Tailwind utilities; `getServerEnv()` from `@/lib/env`; Auth0 helpers (`getAuth0Client`, `getCurrentPrincipal`, `requireAuthenticatedUser`, `requireAssignedPrincipal`, `requireClientPrincipal`, `requireSdkStaff`, `requirePermission`, `requireCompanyAccess`, `tenantWhere`); zod + Prisma (verify models against `prisma/schema.prisma` / `src/generated/prisma`; never raw SQL); server components by default; one component per file; `kebab-case` route dirs; builtin → external → `@/` → relative import order; Read tool for files; split >200-line / 3+ responsibility modules into domain folders with `index.ts` barrels; format Prisma/chained calls across lines with blank-line separation.

**Do NOT use:** `cat`, `sed`, `head`, `tail`, `awk`, `echo`, `grep -r` to read; invented paths/helpers; unstated assumptions; new deps when covered; invented APIs; Pages Router; `any` without comment; `globals.css` edits; repo-root / empty `prisma/`/`tests/` dirs; `.env*`, `node_modules`, `.next/` in commits; guessed Auth0/Prisma shapes; grab-bag / over-atomized files; raw SQL / `$queryRaw` / `$executeRaw` / `pg`.

## Verify before claiming

- `npm run verify` after any code change; review every migration line, then `npx prisma migrate dev`
- Never claim "works" without checks; simplest hypothesis first, cheapest check, widen on failure
- Prefer small, focused edits verified incrementally

## Identity and tenant authorization

- Auth0 = auth/sessions; Postgres = identity, roles, permissions, tenant auth
- Resolve users by Auth0 `sub` only; never by email
- Never authorize from browser/UI/Auth0 claims; company scope from resolved principal
- Reads/writes must include authorized `companyId`; use `requireCompanyAccess` / `tenantWhere`
- SDK staff ≠ client membership; require explicit target company + permission
- No passwords, fallback credentials, or auth bypasses

## Working tree, publishing, database safety

- Preserve unrelated changes; stage explicit paths only
- No push/publish unless requested; inspect DB target before migrations; no destructive recovery

## Agent context management

Project-level auto-compaction in `kilo.jsonc`: compact at 45% context, prune stale output, preserve 2 most recent turns. Do not disable with `KILO_DISABLE_AUTOCOMPACT` / `KILO_DISABLE_PRUNE`.

## MCP servers

Keyless servers in `.mcp.json`, mirrored in `kilo.jsonc` / `opencode.json`. No API keys; prefer over guessing. Keep clean-clone ready: no account-authenticated services, no credentials, pin versions, sync all three.

**Use:** context7 (version-accurate docs; resolve ID, query one concept), next-devtools (inspect running app; `npm run dev` required), playwright (E2E; snapshot first, no screenshots), prisma (migrations + Studio; `prisma-next-*` guidance), maildev (verify emails; `resend-email` pipeline), humanizer (human copy only; `humanize-copy` skill), gh_grep (real examples only; never override repo docs).

**Evidence hierarchy:** 1) repo docs/ADRs/schemas/TS types, 2) deterministic checks, 3) runtime/browser evidence, 4) official context7 docs, 5) gh_grep examples, 6) model memory. Use `websearch` for current facts (3-5 results). MCP output is evidence, not proof; never claim success without local checks passing.

## Docs

`docs/` is the source of truth. Read before touching code:

- `docs/conventions/structure.md` — layout, component/route/env conventions, commit style
- `docs/conventions/env.md` — env vars, setup
- `docs/architecture/*` — auth, RBAC, identity, isolation
- `docs/adr/*` — stack decisions
- `docs/design/brand.md` — logo/brand spec (fixed asset; never re-type). Approved: `docs/brand/` / `public/brand/`. Light on `#082003`, dark on `#d7e8d3`; period `#2cdb16`. Favicon: `S.` mark.
- `docs/design/design-system.md` — tokens, palette, type, surfaces, motion
- `docs/design/patterns.md` — states, form styling
- `docs/design/responsive.md` — breakpoints, grids, touch targets
- `docs/content/voice-and-standards.md` — voice, banned phrases, copy gate
- `docs/content/marketing-architecture.md` — section map + DRAFT copy
- `docs/content/site-map.md` — pages, inventory, issues
- `docs/content/claims-and-evidence.md` — public claims rules
- `docs/content/start-a-project.md` — enquiry form + delivery spec
- `docs/content/legal-pages.md` — legal requirements + review flags
- `docs/agent/failure-taxonomy.md` — failure modes + review tags
- `docs/agent/review-log.md` — logged corrections

In opencode: `@docs` reference.

## Public website guardrails

- Do not rebuild foundation; compose from `docs/content/site-map.md`
- No fabricated proof points from `docs/templates/*.html` (visual reference only)
- No invented clients, testimonials, stats, outcomes, partnerships, awards, history
- Enquiry form must work (Postgres `Enquiry` + Resend); no fake submissions
- Legal pages not "done" until owner/professional review
- New public routes → `PUBLIC_ROUTES` in `src/proxy.ts`
- Copy passes review gate in `docs/content/voice-and-standards.md` §6 before final

## Public SEO and PageSpeed guardrails

Rules in `public-site` skill. Load before any public-facing route/layout/component/image/translation/content work.

## Skills

`.agents/skills/`: `prisma-next-*`, `deploy-to-vercel`, `vercel-cli-with-tokens`, `author-auth0-skill`, `resend-email`, `i18n`, `humanize-copy`, `public-site`, `test-writing`, `bugfix`, `code-review`. OpenCode loads via `skills.paths`; others scan `.agents/skills/`.

## Deterministic enforcement

Formatter, permissions, PR gate (`agent-pr-eval`) in `opencode.json` / `kilo.jsonc`. `verify` includes `format:check`; warnings/notices/skips fail.

## Project commands

```bash
npm run dev         # Start dev server (Turbopack) + local mail sink
npm run build       # prisma generate + production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test        # Vitest
npm run mail        # Local mail sink (SMTP :1025, HTTP API :1080)
npm run mail:list   # List emails
npm run mail:read -- <id>  # Read email body
npm run mail:wait "match"  # Wait for matching email
npm run mail:clear  # Empty sink
npx prisma migrate dev
npx prisma db seed  # DEVELOPMENT ONLY
```

## Conventions

Read `docs/conventions/structure.md` before writing any code — directory layout, component/route/env conventions, and commit-message style are mandatory.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
