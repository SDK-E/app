# Design & Content Foundation — Review Record

Result of the verification passes for this phase. Rendered reference:
`/design-system`. Specs under review: `docs/design/*`, `docs/content/*`.

## 1. Visual consistency & reference alignment (B10)

Compared the rendered foundation against `docs/templates/landing-page-template.html`
and `docs/templates/client-dashboard-example.html`.

| Check | Result |
|---|---|
| Palette tokens match the reference palette | Pass — `dark #082003`, `brand #2cdb16`, `light #d7e8d3`, `paper #f8fbf7`, `line #9db497`; `muted` standardized on the reference's `#536b4f` (was `#667d61`, AA fail) |
| Typeface is JetBrains Mono only | Pass — Geist removed from `layout.tsx`; `--font-sans` and `--font-mono` both resolve to JetBrains Mono |
| Type ramp values match the reference (76/52/42/23/18px + tracked labels) | Pass |
| Container 1220px, section padding 84→48px, `1px` border-top rhythm | Pass — `Container`, `Section` implement this |
| Radii limited to 7/8/10px + pills for tags | Pass — `rounded-nav/control/card` |
| Light / dark / brand section composition | Pass — `Section` tones; dark surfaces use `fog` secondary, `line` borders darken to `#2d4b28` |
| Wordmark rendered from approved asset (not re-typed) | Pass — header uses `public/brand/sdk-logo-light.png`; period `#2cdb16` = `rgb(44,219,22)`; spec in `docs/design/brand.md` |
| No invented styles / glassmorphism / gradients / heavy shadows | Pass |
| Non-reusable fabricated claims ("600+", banking/telecom cases) excluded from copy | Pass — replaced in `docs/content/marketing-architecture.md` |

## 2. Responsive foundations (B11-a)

Headless Chromium at 1280 / 1024 / 768 / 390px.

| Check | 1280 | 1024 | 768 | 390 |
|---|---|---|---|---|
| Horizontal overflow | none | none | none | none |
| Metrics grid columns | 4 | 4 | 2 | 1 |
| Inline nav visible | yes | yes | yes | no |
| Mobile menu button | hidden | hidden | hidden | visible |
| Menu opens → panel with links + CTA, tap-to-close | — | — | — | pass |

## 3. Accessibility basics (B11-b)

| Check | Result |
|---|---|
| Keyboard focus ring visible (Tab traversal) | Pass — `focus-visible` outline, 2px, verified live |
| Text contrast AA (4.5:1) | Pass — worst pair `muted` on `light` = 4.57:1 |
| Green rules enforced (bg ⇒ dark text; text only on dark) | Pass — `brand` pair 9.24:1 both ways |
| Landmarks / ARIA | Pass — `nav` with `aria-label`, menu `aria-expanded` + `aria-label`, `aria-hidden` on decorative icons |
| Reduced motion | Pass — `motion-reduce:transition-none`, skeleton `motion-reduce:animate-none` |
| Non-text contrast (interactive borders ≥ 3:1) | Documented for future inputs in `patterns.md` §8 (`line` borders are decorative only) |
| Console / page errors | none at any viewport |

## 4. Copy quality & generic-AI-language removal (B11-c)

Applied `docs/content/voice-and-standards.md` §6 to
`docs/content/marketing-architecture.md`.

- Banned-phrase scan: none found (grep of §2 list).
- Paste test: retained reference copy is specific; every retained sentence
  names a capability, stack or mechanism.
- Claim audit: fabricated "600+", banking/telecom cases, dashboard metrics and
  personas removed; remaining proof points are positioning claims and are
  flagged to confirm before launch.
- Heading check: every section heading communicates an idea (e.g. "Use all of
  the stack — or only the part you need.").
- Section purpose: each section maps to one of the six questions in the
  standards.
- First-pass independence: copy is marked DRAFT and must pass this gate again
  before page implementation.

## 5. Open items

- Pixel-level comparison of screenshots was not possible in this environment
  (no image review); structural/computed verification used instead. A human
  visual pass over `/design-system` at the four widths is recommended before
  sign-off.
- "About" nav item has no dedicated section yet (maps to contact band).
- Proof points in `marketing-architecture.md` §4 need confirmation of truth
  before launch.
- **Header active-nav token bug:** `Header.tsx` uses `text-accent` for the
  active nav link; `--accent` in `:root` (`globals.css`) is `#d7e8d3` (light),
  so the active state is invisible on the light header. `design-system.md`
  says active nav should be `brand`, but its §2.1 forbids green text on light
  surfaces (contrast ≈ 1.5:1). Needs a corrective bead that picks a
  contrast-safe active state and updates the design-system doc.
- **`Tag` primitive missing:** `design-system.md` §7 lists a `Tag` pill
  component that is not implemented in `src/components/ui/`. Implement per
  spec if needed, or reuse `Badge`/`micro` styling.
- **Stale doc:** `docs/architecture.md` §12 says `src/lib/auth-guards.ts`
  does not exist; it does. See `docs/content/site-map.md` §5.

## 6. Landing page (post-foundation)

The public landing page was built on this foundation at `src/app/(marketing)/page.tsx`
(sections in `src/components/marketing/`), `/` made public in the proxy.
Verified headless at 1280/1024/768/390px: no horizontal overflow, no
console/page errors, hero scales 76→40px, all sections render with anchors
(`services`, `why`, `work`, `process`, `about`), mobile menu opens with all
links. Copy taken from `marketing-architecture.md` (still DRAFT; must pass the
copy gate before it is treated as final).
