# AGENTS.md

## Tech stack (exact versions)

Do not assume versions — the exact stack is:

- **Next.js 16.3.1** — App Router only (no Pages Router, no `pages/`, no `getServerSideProps`)
- **React 19.2.8** + **TypeScript 5** (`strict: true`)
- **Tailwind CSS v4** — styling only (no CSS modules, no styled-components)
- **Prisma 7.9.1** (Postgres) — all data access; **zod 4.4.3** — all validation
- **@auth0/nextjs-auth0 4.26.0** — authentication
- **Vitest 4** + Testing Library — unit tests; Playwright — E2E via the MCP
  server (no `playwright.config.ts` project config yet)
- Path alias `@/*` → `./src/*`

## Coding standards (write standard, project-idiomatic code)

**Use:**

- Tailwind utility classes for all styling.
- `getServerEnv()` / `publicEnv` from `@/lib/env` — never `process.env` directly.
- Auth helpers: `getAuth0Client()` from `@/lib/auth`; `requireAuth`, `requireRole`,
  `requireCompanyAccess` from `@/lib/auth-guards`.
- zod for env/input validation (see `src/lib/env.ts`).
- Prisma for every DB operation (see the `prisma-next-*` skills) — never raw SQL.
- Server components by default; `"use client"` only when interactivity requires it;
  `route.ts` handlers are server-only.
- One component per file; named exports for shared components, default exports for routes.
- Route dirs `kebab-case`; reserved route files only (`page.tsx`, `layout.tsx`, ...).
- Import order: builtin → external → internal `@/` → relative.

**Do NOT:**

- Invent file paths or helper functions — verify they exist with grep/glob first.
- Assume unstated requirements or context (team size, sharing needs, deployment
  targets, who will use the code). Ask the user instead of building for a
  hypothetical audience.
- Add a new dependency when Next, Prisma, zod, or Auth0 already cover the need.
- Invent library APIs or config keys — check `context7` or the installed types first.
- Use Pages Router patterns, `next/router`, or `getServerSideProps`.
- Write `any` without a justification comment.
- Edit `src/app/globals.css` for component styles.
- Create files at the repo root, or pre-create empty `prisma/` / `tests/` dirs.
- Commit `.env*` files, generated artifacts, `node_modules`, or `.next/`.
- Guess Auth0 session / Prisma result shapes — use the typed helpers above.

## Verify before claiming

- After any code change run: `npm run typecheck && npm run lint && npm run test`.
- Migrations: review every line, then `npx prisma migrate dev`.
- Never claim a change "works" without running the checks.
- Prefer small, focused edits verified incrementally over one big rewrite.

## MCP servers

Keyless MCP servers are configured in `.mcp.json` (read by Claude Code, Cursor,
Windsurf, VS Code, Zed, etc.) and mirrored for opencode in `opencode.json`.
Any agent can start using them right after `npm install` — no API keys required.
Prefer them over guessing: they are the cheapest way to avoid hallucinations.

- **context7** — version-accurate docs for the libraries in this repo
  (Next.js, React, Prisma). Use when you need library/docs help.
- **next-devtools** — Next.js internals (routes, server actions, bundler).
  Requires `npm run dev` to be running.
- **playwright** — browser automation for end-to-end flows (e.g. the Auth0
  login flow).
- **prisma** — Prisma CLI operations (migrate, generate, studio) directly from
  the agent. Reads this project's `prisma.config.ts`.
- **maildev** — local dev mail sink: `list_emails`, `read_email`,
  `clear_emails`, `wait_for_email`. Requires `npm run dev` (sink auto-starts).
  Use it to verify the enquiry form's notification email — no UI.
- **humanizer** — keyless local prose editor: `humanize_text`, `humanize_texts`,
  and `humanize_file` improve selected human-facing copy with conservative local
  edits, then check protected values. File reads are workspace-restricted and read-only. It is
  an editing tool, not a source of truth; verify facts before and after use.
- **gh_grep** — real-world code examples from GitHub (grep.app). Use when
  unsure how something is done in practice.

## Docs

`docs/` is the source of truth for how this codebase is built. Read the
relevant file before touching code:

- `docs/conventions/structure.md` — directory layout, component/route/env
  conventions, commit-message style (mandatory).
- `docs/conventions/env.md` — every env var, its requirement level, and local
  setup.
- `docs/architecture/*` — auth, RBAC, identity, resource isolation.
- `docs/adr/*` — decisions behind the stack (Auth0, role model, isolation,
  database choice).
- `docs/design/brand.md` — logo & brand-mark specification (mandatory). The
  SDK Enterprises logo is a fixed graphic asset: never re-type "SDK." or "S."
  with JetBrains Mono or another font. Use the approved assets in
  `docs/brand/` (canonical) / `public/brand/` (app copies). Approved combos:
  light wordmark on `#082003`, or dark wordmark on `#d7e8d3`; period always
  `#2cdb16`. Favicon is the compact `S.` mark (one S, one period).
- `docs/design/design-system.md` — tokens, palette, type ramp, surfaces,
  components, motion (mandatory before writing UI).
- `docs/design/patterns.md` — focus/hover/disabled/loading/empty/error states,
  form styling.
- `docs/design/responsive.md` — breakpoints, grids, navigation, touch targets.
- `docs/content/voice-and-standards.md` — voice, banned phrases, copy review
  gate (mandatory before writing any copy).
- `docs/content/marketing-architecture.md` — approved section map + DRAFT copy
  for the public site.
- `docs/content/site-map.md` — current state, target public pages, component
  inventory, known foundation issues.
- `docs/content/claims-and-evidence.md` — what SDK may and may not claim
  publicly (mandatory before writing marketing copy; governs case studies).
- `docs/content/start-a-project.md` — approved public enquiry form + delivery
  spec (Enquiry table + Resend).
- `docs/content/legal-pages.md` — legal page requirements + review flags.

In opencode, these are also exposed as an `@docs` reference.

## Public website guardrails

- **Do not rebuild the foundation.** Tokens, shared components, brand assets,
  the existing homepage and the marketing sections in `src/components/marketing/`
  are deliberate. Compose new pages from them (`docs/content/site-map.md`).
- **Never reuse fabricated proof points** from `docs/templates/*.html` (the
  "600+ applications", banking/5G case studies and dashboard personas are
  visual reference only — see `docs/content/claims-and-evidence.md`).
- **Never invent** clients, testimonials, statistics, outcomes, partnerships,
  awards, or company history.
- **The enquiry form must really work** (Postgres `Enquiry` table + Resend
  email per `docs/content/start-a-project.md`) — no fake submissions.
- **Legal pages** must not invent compliance claims and are not "done" until
  owner/professional review (`docs/content/legal-pages.md`).
- Any new public route must be added to `PUBLIC_ROUTES` in `src/proxy.ts`.
- Copy passes the review gate in `docs/content/voice-and-standards.md` §6
  before it is treated as final.

## Skills

Skills live in `.agents/skills/` and are committed:

- `prisma-next-quickstart`, `prisma-next-queries`, `prisma-next-migrations`,
  `prisma-next-debug` — Prisma + Next.js workflows.
- `deploy-to-vercel`, `vercel-cli-with-tokens` — Vercel deploys.
- `author-auth0-skill` — Auth0.
- `resend-email` — transactional email via Resend (the enquiry-form
  notification pipeline).
- `i18n` — next-intl v4, 17 European locales, legal pages, locale-prefixed
  routing and translation conventions.
- `humanize-copy` — selective copy humanization, review, fact preservation,
  website and technical writing, and the final content-pass workflow.
- opencode loads these via `skills.paths` in `opencode.json`; other agents
  scan `.agents/skills/` themselves.

## Project commands

```bash
npm run dev         # Start dev server (Turbopack) + local mail sink
npm run build       # prisma generate + production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test        # Vitest
npm run mail        # Run the local mail sink standalone (SMTP :1025, HTTP API :1080)
npm run mail:list   # List emails in the sink
npm run mail:read -- <id>   # Read a sink email's full body
npm run mail:wait "match"   # Block until a matching email arrives (verify the form)
npm run mail:clear  # Empty the sink
npx prisma migrate dev
npx prisma db seed  # DEVELOPMENT ONLY
```

## Conventions

Follow the docs above: read `docs/conventions/structure.md` before writing any
code — its directory layout, component/route/env conventions, and
commit-message style are mandatory.
