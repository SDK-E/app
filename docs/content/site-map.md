# SDK Enterprises — Public Site Map & Current State

What is already built (the deliberate foundation), what this batch must build,
and the component inventory. **Read this before inspecting or modifying the
marketing site.** The foundation was established on purpose — do not rebuild,
replace or casually restructure it.

## 1. What the foundation established (do NOT rebuild)

- Tech stack and tooling (see `AGENTS.md`): Next.js 16 App Router, React 19,
  TS strict, Tailwind v4, Prisma 7 (Postgres, classic generated client in
  `src/generated/prisma/`), zod 4, Auth0.
- Design system: tokens in `src/app/globals.css` (`@theme`), surfaces,
  typography ramp, radii — `docs/design/design-system.md`.
- Interaction/feedback patterns — `docs/design/patterns.md`.
- Responsive conventions — `docs/design/responsive.md`.
- Brand assets + rules — `docs/design/brand.md`, `public/brand/*`.
- Auth0 wiring, guards, env access, proxy, Prisma, CI.

## 2. Current routes

| Route | File | Status |
|---|---|---|
| `/` | `src/app/(marketing)/page.tsx` | **Exists** — landing page assembling the marketing sections below (hero, services, why, engagements, process, contact, footer) |
| `/design-system` | `src/app/design-system/page.tsx` | Exists — renders every token/primitive/state |
| `/login`, `/logout` | `src/app/(app)/login`, `src/app/(app)/logout` | Exists — `/login` redirects to the Auth0 provider |
| `/auth/*` | Auth0 SDK | Exists |
| `/app/*` | — | **Not built.** Client portal is future work; out of scope for this batch (public website only). Do not build portal UI. |

`src/proxy.ts` `PUBLIC_ROUTES = ["/", "/login", "/auth/*", "/favicon.ico", "/design-system"]`.
Any new public page must be added there.

## 3. Component inventory (reuse these; do not rewrite)

| Component | File |
|---|---|
| `Button` | `src/components/ui/Button.tsx` |
| `Badge` | `src/components/ui/Badge.tsx` |
| `Card` | `src/components/ui/Card.tsx` |
| `ArrowLink` | `src/components/ui/ArrowLink.tsx` |
| `Skeleton` | `src/components/ui/Skeleton.tsx` |
| `EmptyState` | `src/components/ui/EmptyState.tsx` |
| `ErrorState` | `src/components/ui/ErrorState.tsx` |
| `Container` / `Section` / `SectionHeader` | `src/components/layout/{Container,Section,SectionHeader}.tsx` |
| `Header` | `src/components/layout/Header.tsx` (approved logo, 11px uppercase nav, mobile menu) |
| `Hero`, `ServicesSection`, `WhySdkSection`, `EngagementsSection`, `ProcessSection`, `ContactSection`, `SiteFooter` | `src/components/marketing/*` |

Rules:

- Marketing sections are **reusable blocks**. Compose pages from them; extract
  new sections into `src/components/marketing/` following the same shape
  (named export where shared).
- `components/ui/*` stays presentational — no data fetching.
- The header uses the approved light-surface logo asset
  (`public/brand/sdk-logo-light.png`). Never re-type the logo.

## 4. Target public pages for this batch

| Page | Route | Build guidance |
|---|---|---|
| Homepage | `/` | Already exists — keep and evolve it. Do not rebuild. Convert anchor nav to real links when dedicated pages land. |
| Services | `/services` | Reuse `ServicesSection`; add deeper service experiences per the brief §5. Copy from `marketing-architecture.md` §3; pass the copy-review gate. |
| Work / case studies | `/work` (or `/case-studies`) | Use the scenario/engagement framing. **No fabricated clients/outcomes** — `docs/content/claims-and-evidence.md` §3. |
| How we work | `/how-we-work` | `marketing-architecture.md` §6 process; brief §7 engagement model. |
| About | `/about` | Company-focused, not a founder résumé (brief §7). `marketing-architecture.md` contact/company facts. |
| Start a project | `/start-a-project` | `docs/content/start-a-project.md` — approved form + delivery spec. Add to `PUBLIC_ROUTES`. |
| Legal | `/legal/mentions-legales`, `/privacy`, `/terms`, `/cookies` | `docs/content/legal-pages.md`. |

Copy for all pages comes from `docs/content/marketing-architecture.md` (still
DRAFT) and must pass the review gate in `docs/content/voice-and-standards.md`
§6 — the batch must include dedicated copy-review beads.

## 5. Known foundation issues (handle with evidence, not silent rewrites)

1. **Header active-nav token bug.** `src/components/layout/Header.tsx` uses
   `text-accent` for the active nav link, but `--accent` in `:root`
   (`src/app/globals.css`) is `#d7e8d3` — light on light, so the active state
   is invisible. The docs conflict: `design-system.md` palette lists brand green
   as "active nav", while its §2.1 forbids green text on light surfaces
   (contrast ≈ 1.5:1, fails AA). Create a corrective bead that picks an active
   state satisfying contrast (e.g. dark text + brand underline/marker) and
   update `docs/design/design-system.md` accordingly.
2. **`Tag` primitive referenced but not implemented.** `design-system.md` §7
   lists a `Tag` pill component; `src/components/ui/` has none. Implement it
   per the spec if tags are needed, or use `Badge`/`micro` styling.
3. **Marketing copy is DRAFT.** `docs/content/marketing-architecture.md` must
   pass the copy-review gate before pages treat it as final. Proof points in
   its §4 need owner confirmation (`claims-and-evidence.md` §5).
4. **Stale doc:** `docs/architecture.md` §12 says `src/lib/auth-guards.ts`
   does not exist — it does (`requireAuth`, `requireRole`,
   `requireCompanyAccess`). Ignore the "not implemented" claims for those
   guards; `requireStaffRole` remains genuinely unimplemented.

## 6. Verification tooling for this batch

- Unit tests: Vitest (`npm run test`). Colocate `*.test.ts(x)` with code.
- Browser checks (responsive, a11y, console errors): Playwright via the MCP
  server at the four widths from `docs/design/responsive.md` §7 (1280/1024/768/390).
- CI (`.github/workflows/ci.yml`): lint, typecheck, build, `npm run test:run`.
  Keep it green; do not weaken checks.
