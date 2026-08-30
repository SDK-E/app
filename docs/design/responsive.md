# SDK Enterprises — Responsive Foundation

How the website and client portal behave across desktop, laptop, tablet and
mobile. **Mobile is not compressed desktop** — layout, type and navigation
re-compose deliberately at each size.

## 1. Breakpoints

Tailwind defaults:

| Name | Min-width | Used for                                 |
| ---- | --------- | ---------------------------------------- |
| `sm` | 640px     | Small phone → large phone / small tablet |
| `md` | 768px     | Tablet → small laptop; nav expands       |
| `lg` | 1024px    | Desktop; 3–4 column grids appear         |
| `xl` | 1280px    | Full desktop container comfort           |

Design is desktop-first authored, mobile-first responsive (build mobile, layer
up with `sm:`/`md:`/`lg:`).

## 2. Container & padding

- Max width `1220px`, centered, `mx-auto`.
- Horizontal padding: `24px` below `sm`, `32px` from `sm` up.
- Section vertical padding: `48px` mobile, `56px` tablet, `84px` desktop
  (`py-12 md:py-14 lg:py-[84px]` on `Section`).

## 3. Typography scaling

Type is set large on desktop and steps down deliberately — never squeezed or
hyphen-stuffed.

| Role            | Mobile                      | Desktop   |
| --------------- | --------------------------- | --------- |
| Hero `display`  | `40px`                      | `76px`    |
| Section `title` | `36px`                      | `52px`    |
| Portal `h1`     | `32px`                      | `42px`    |
| `h3`            | `20px`                      | `23px`    |
| `lead` / `body` | unchanged (`18px` / `14px`) | unchanged |

Recommended classes: `text-[40px] md:text-display` (hero),
`text-[36px] md:text-title` (section), `text-[32px] md:text-h1` (portal page
heading). Keep the tracking tokens at every size.

Line length caps at ~65ch; on mobile that is naturally satisfied.

## 4. Grids

| Grid                                 | Mobile  | `sm`    | `lg`                 |
| ------------------------------------ | ------- | ------- | -------------------- |
| 4-column (metrics, proofs)           | 1       | 2       | 4                    |
| 3-column (service cards)             | 1       | 2       | 3                    |
| 2-column (case studies, content)     | 1       | 1       | 2                    |
| Section head (eyebrow + title/intro) | stacked | stacked | 2-col `.65fr/1.35fr` |

Gaps stay `12–14px` at every size. Cards never shrink below a comfortable
reading width — recompose the column count instead.

## 5. Navigation

- **Desktop / tablet (`md`+):** inline header links, 11px uppercase, CTA
  button on the right. Wordmark left.
- **Mobile (below `md`):** links and CTA collapse behind a menu button
  (40px+ target, square stroke icon). Tapping opens a full-width panel under
  the header with stacked links (48px tap rows) and the CTA as a full-width
  button. Tapping a link closes the panel.
- The menu is a `<button>` with `aria-expanded` and `aria-label`; the panel is
  still inside the `<nav>` landmark.
- Portal: the dark sidebar (260px on desktop) collapses to a 72px icon rail
  via a toggle button in the sidebar header (`aria-expanded`, animated width,
  persisted). Below `lg` it remains a horizontal top bar and the account menu
  moves to the page header; the collapse toggle is hidden.

## 6. Touch & interaction

- Interactive targets are at least `44×44px` on touch devices (nav rows,
  buttons, menu button). Where the reference looks smaller, add padding —
  never shrink the target.
- `hover` styles must not be the only affordance: on touch there is no hover.

## 7. Checks

Every screen must be reviewed at `1280`, `1024`, `768` and `390px` widths
before it is done. See `docs/design/design-system.md` §9 for the
`/design-system` reference page.
