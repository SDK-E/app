# SDK Enterprises — Design System

Single source of truth for how SDK Enterprises products look and behave: the
public website and the future client portal must belong to the same product
family. Both use this system.

## 1. Sources

This system is extracted from the approved Canva design references:

- `docs/templates/landing-page-template.html` — public website reference
- `docs/templates/client-dashboard-example.html` — client portal reference

Both exports share the same palette, typeface, spacing, radii and border
language. This document distills them into one coherent system. Where the
exports disagree with usability or accessibility, this document overrides them
(the system is extracted, not blindly reproduced).

### 1.1 Reference content that is NOT reusable

The exports contain fabricated proof points. These are visual-reference only
and must never appear in copy:

- "600+ applications involved in enterprise cloud migration work"
- Banking / telecom case studies ("Large-scale migration of internal
  applications", "High-volume 5G monitoring platform")
- Dashboard metrics and user names (Marie Dupont, ACME SAS, live invoice
  amounts)

Real, verifiable company data that MAY be reused: company name, SIREN/SIRET,
address, phone, email. See `docs/content/voice-and-standards.md`.

## 2. Palette

| Token        | Hex       | Usage                                                                                       |
| ------------ | --------- | ------------------------------------------------------------------------------------------- |
| `dark`       | `#082003` | Primary text on light; dark section backgrounds; strong buttons                             |
| `brand`      | `#2cdb16` | Primary actions (background); highlights on dark (text); active nav                         |
| `light`      | `#d7e8d3` | Page background; primary text on dark surfaces                                              |
| `paper`      | `#f8fbf7` | Card/surface background on light pages                                                      |
| `muted`      | `#536b4f` | Secondary/tertiary text on light surfaces (AA ≥ 4.5:1); rendered as `text-muted-foreground` |
| `fog`        | `#abc4a6` | Secondary text on dark surfaces                                                             |
| `line`       | `#9db497` | Thin borders and separators on light surfaces                                               |
| `background` | `#d7e8d3` | Alias for page background (`bg-background`)                                                 |
| `foreground` | `#082003` | Alias for primary text (`text-foreground`)                                                  |

The shadcn semantic variables (`--muted`, `--accent`, `--border`, `--input`,
`--ring`, …) in `src/app/globals.css` derive from this palette. Note that
shadcn's `muted` and `accent` utilities are _surface_ tones (subtle hover
backgrounds); the `#536b4f` text color is `text-muted-foreground`. The brand
green is a plain theme token (`bg-brand`), not shadcn's `accent`.

### 2.1 Color rules

- Brand green is used for **actions and meaningful highlights only**. It is
  never decorative.
- Brand green as a **background** always carries `dark` text
  (`bg-brand text-dark`).
- Brand green as **text** is only legible on dark surfaces
  (`text-brand` on `bg-dark`). Never use green text on light surfaces.
- On dark surfaces use `light` for primary text and `fog` for secondary text.
- Borders are always `1px` and thin/restrained. Dark surfaces use a darker
  border (`#2d4b28`) to stay subtle.

## 3. Typography

Typeface: **JetBrains Mono**, weights 400–800. It is the brand typeface for
everything — headings, body, labels, code. There is no secondary sans-serif.

Loaded via `next/font/google` as `--font-jetbrains`; both `--font-sans` and
`--font-mono` resolve to it.

### 3.1 Type ramp

Sizes are tokenized in `src/app/globals.css` (`--text-*`). Use the tokens, do
not invent new sizes.

| Token     | Size | Line-height | Tracking | Use                                 |
| --------- | ---- | ----------- | -------- | ----------------------------------- |
| `display` | 76px | 0.95        | -0.065em | Landing hero headline               |
| `title`   | 52px | 1           | -0.05em  | Section headings                    |
| `h1`      | 42px | 1.04        | -0.045em | Portal page headings                |
| `h3`      | 23px | 1.12        | normal   | Card/block titles                   |
| `lead`    | 18px | 1.7         | normal   | Hero lead paragraph                 |
| `body`    | 14px | 1.7         | normal   | Base body copy                      |
| `label`   | 11px | 1           | +0.14em  | Eyebrows, nav, buttons, table heads |
| `micro`   | 10px | 1           | +0.11em  | Meta, captions, tags                |

### 3.2 Typography rules

- **A11y floor:** body copy is never smaller than 14px. The exports use 9–11px
  in several places; those sizes are allowed for labels, meta, tags and
  captions only — never for paragraphs of content.
- Headlines use tight letter-spacing (see ramp). Never add letter-spacing to
  body copy.
- Uppercase + letter-spacing is reserved for eyebrows, nav links, buttons and
  field labels — a deliberate editorial device, used sparingly.
- Line length for body copy is capped at ~65ch.
- Heading style communicates an idea, not a label
  (see `docs/content/voice-and-standards.md`).

## 4. Spacing & rhythm

- **Container:** `max-width: 1220px`, horizontal padding `24px`
  (`px-6` on mobile, `px-8`+ on desktop), centered.
- **Section padding:** `84px` vertical on desktop, `56px` on tablet, `48px` on
  mobile. Sections stack with a `1px` border on top
  (`border-t border-line`) except when the previous surface already divides
  them (e.g. dark section following light).
- **Section head:** eyebrow + title + intro in a two-column grid
  (`.65fr / 1.35fr`, 50px gap). Below `md` the grid collapses to one column.
- **Grid gaps:** card grids use `12–14px` gaps. Metrics use `12px`.
- **Whitespace is the primary separator.** Prefer more space over more rules
  and borders.

## 5. Radii & borders

| Token             | Value | Use                        |
| ----------------- | ----- | -------------------------- |
| `rounded-card`    | 10px  | Cards, panels, contact box |
| `rounded-control` | 8px   | Buttons, inputs            |
| `rounded-nav`     | 7px   | Nav items, sidebar links   |
| `rounded-full`    | 999px | Tags/pills only            |

- Limited, consistent radius. Never randomly larger radii.
- All borders are `1px`, using `line` (light) or `#2d4b28` (dark).
- Dividers: `border-t` between sections; `border-t` with stronger weight
  (`2px`, dark) for process steps.

## 6. Surfaces & composition

Three section tones, used to create light/dark composition and purposeful
variation:

| Tone              | Background | Text    | Secondary text     |
| ----------------- | ---------- | ------- | ------------------ |
| `light` (default) | `light`    | `dark`  | `muted-foreground` |
| `dark`            | `dark`     | `light` | `fog`              |
| `brand`           | `brand`    | `dark`  | `dark`             |

- **One brand section per page at most** (e.g. the contact band).
- Cards sit on `paper` with a `line` border — on the `light` page background
  the card surface is the contrast, not a shadow. No heavy shadows, no
  glassmorphism, no gradients.
- Purposeful variation means alternating tones and grid widths between
  sections — not a new invented style per section.

## 7. Components

Defined and implemented in `src/components/ui` (interactive/feedback) and
`src/components/layout` (structure). See `docs/design/patterns.md` for states
(loading, empty, error, focus).

| Component                                 | Definition                                                                                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                  | 11px, 800 weight, uppercase; primary = `bg-brand text-dark`, outline = `border border-dark`, dark = `bg-dark text-light`; radius `rounded-control`; padding `14px 18px`; focus ring visible |
| `Badge`                                   | Status chip: `live` (green bg / dark text), `review` (dark border), `neutral` (line border); radius `rounded-control`; 9px, 800 weight, uppercase                                           |
| `Card`                                    | `bg-paper border border-line rounded-card`; padding `24px` (page cards), `17px` (portal panels)                                                                                             |
| `Tag`                                     | Pill (`rounded-full`), 9px, thin `line` border                                                                                                                                              |
| `ArrowLink`                               | 9–11px inline link with `→` suffix, used for "View all →" affordances                                                                                                                       |
| `Header`                                  | Approved logo asset (`public/brand/sdk-logo-light.png` — dark wordmark + `#2cdb16` period on `--color-light`; never re-typed); 11px uppercase nav links; CTA button; mobile collapse        |
| `Container` / `Section` / `SectionHeader` | Structural primitives per §4 and §6                                                                                                                                                         |

## 8. Motion

Restrained. Use for purpose, not decoration:

- Hover: `transition-opacity` on links/buttons (or a `150ms` color/bg ease).
- No entrance animations, parallax, marquees or floating elements.
- Respect `prefers-reduced-motion`: disable all transitions/animations.

## 9. Implementation notes

- Tokens live in `src/app/globals.css` under `@theme`. Component styles are
  colocated with components or applied via utilities — never add component
  styles to `globals.css` (see `docs/conventions/structure.md`).
- Do not add new tokens without updating this document.
- The verification page `/design-system` renders every token, primitive and
  state in this document. Use it as the reference during development.
