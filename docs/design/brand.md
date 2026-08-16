# SDK Enterprises — Logo & Brand Mark Specification

Canonical brand guideline for the SDK Enterprises logo. **Every agent MUST
follow this document.** The logo is a fixed graphic asset — it must never be
recreated with application fonts or re-drawn.

## 0. Assets in this repository

| Asset                                                                      | Canonical source            | App copy (served at)              |
| -------------------------------------------------------------------------- | --------------------------- | --------------------------------- |
| Full wordmark, dark surface (light letters, `#2cdb16` period on `#082003`) | `docs/brand/Logo Dark.png`  | `public/brand/sdk-logo-dark.png`  |
| Full wordmark, light surface (dark letters, `#2cdb16` period on `#d7e8d3`) | `docs/brand/Logo Light.png` | `public/brand/sdk-logo-light.png` |
| Compact `S.` mark, dark surface                                            | `docs/brand/Mark Dark.png`  | `public/brand/sdk-mark-dark.png`  |
| Compact `S.` mark, light surface                                           | `docs/brand/Mark Light.png` | `public/brand/sdk-mark-light.png` |

- `docs/brand/` is the source of truth; `public/brand/` copies are trimmed for
  in-app use (uniform brand-surface margin removed; glyph geometry unchanged).
- The header wordmark uses the **light variant** (`sdk-logo-light.png`) because
  the header surface is `--color-light` (`#d7e8d3`).
- The favicon is generated from the compact dark mark
  (`src/app/favicon.ico`, `src/app/apple-icon.png`).
- These are the only approved assets. Do not re-type or re-draw the mark.

## 1. Primary Mark

The official SDK Enterprises logo is the wordmark:

**SDK.**

It consists of three uppercase geometric letterforms followed by a distinct
circular period. The mark should feel technical, minimal, precise, and
slightly terminal/code-inspired without looking like a developer-tool logo.

The bright-green period is a deliberate part of the identity and must always
be retained.

## 2. Approved Color Variants

### Dark Variant

- Background: `#082003`
- SDK letters: `#d7e8d3`
- Period: `#2cdb16`

This is the primary brand treatment and is preferred for dark website
sections, headers, presentations, social media, and other branded surfaces.

### Light Variant

- Background: `#d7e8d3`
- SDK letters: `#082003`
- Period: `#2cdb16`

Use this version on light website sections, documents, dashboards, invoices,
and other light surfaces.

The period remains `#2cdb16` in both variants.

## 3. Logo Construction

The logo uses a bold geometric sans-serif construction rather than the
JetBrains Mono typeface used throughout the wider SDK Enterprises brand.

Visual characteristics:

- Uppercase SDK
- Heavy/bold weight
- Geometric construction
- Low-contrast strokes
- Tight but deliberate spacing
- Clean, modern terminals
- Separate circular period

**Do not recreate the logo by typing `SDK.` in JetBrains Mono or another
approximate font.** For production use, the approved logo should be stored and
used as an SVG/vector asset so the exact geometry is preserved.

JetBrains Mono remains the wider brand and interface typeface; the logo is its
own graphic asset.

## 4. The Green Period

The period is a core brand element, not simply punctuation rendered by the
logo font. It must:

- Always be circular
- Always use `#2cdb16` in standard color applications
- Sit on the same visual baseline as the wordmark
- Remain clearly separated from the K
- Never be replaced by a normal typographic `.` glyph

The green period may also inspire secondary brand elements such as active
states, status indicators, section markers, loading states, favicon/app-icon
concepts, and subtle motion treatments. These secondary uses must not alter
the official wordmark.

## 5. Clear Space

Define **X** as the diameter of the green period. Maintain at least **1X** of
clear space around the complete logo. For large hero and brand applications,
1.5X–2X clear space is preferred. No text, borders, icons, photographs, or
other strong visual elements should enter the clear-space area.

## 6. Minimum Size

- **Digital — recommended minimum width:** 100px
- **Absolute minimum full-wordmark width:** approximately 72px
- **Typical navigation usage:** approximately 100–140px
- **Hero/large branding:** scale freely from the asset

At very small sizes, use the approved compact mark (`S.`) rather than
squeezing the complete wordmark into an icon-sized area.

## 7. Scaling

Always scale the complete logo proportionally. Never:

- Stretch it horizontally
- Compress it vertically
- Alter individual letter proportions
- Change the letter spacing
- Move the period independently
- Resize only the period

Treat the complete `SDK.` composition as one locked mark.

## 8. Background Usage

Canonical combinations:

- **Dark Surface:** surface `#082003`, wordmark `#d7e8d3`, period `#2cdb16`
- **Light Surface:** surface `#d7e8d3`, wordmark `#082003`, period `#2cdb16`

On photography, gradients, or visually complex backgrounds, prefer placing
the logo on an approved solid brand surface rather than dynamically
recoloring the mark.

## 9. Incorrect Usage

Never:

- Remove the green period from the official wordmark
- Recolor the period
- Substitute approximate brand colors
- Add gradients inside the logo
- Add shadows or glows
- Add outlines
- Rotate the mark
- Distort its proportions
- Change letter spacing
- Reposition the period
- Recreate the logo using JetBrains Mono
- Recreate it with a "close enough" font
- Place it inside an arbitrary badge or rounded rectangle
- Apply decorative effects to individual letters

## 10. Developer Specification

- Official wordmark: `SDK.`
- The logo is a fixed graphic asset and **MUST NOT** be recreated using
  application fonts.
- **Primary / dark:** background `#082003`, letters `#d7e8d3`, period `#2cdb16`
- **Light:** background `#d7e8d3`, letters `#082003`, period `#2cdb16`
- The bright-green period is part of the official mark and must always be
  retained.
- Use the supplied assets whenever possible.
- Maintain clear space of at least 1× the diameter of the green period around
  the complete mark.
- Minimum recommended digital width: 100px. Absolute minimum full-wordmark
  width: approximately 72px.
- The logo should normally appear only in one of its two approved
  combinations:
  1. Light wordmark on `#082003`
  2. Dark wordmark on `#d7e8d3`

The period remains `#2cdb16` in both.

## 11. Brand Asset Recommendation

Maintain canonical vector assets for at least:

- `sdk-logo-dark.svg` — light wordmark for dark surfaces
- `sdk-logo-light.svg` — dark wordmark for light surfaces

A dedicated compact mark/favicon should be designed and approved separately
rather than being independently invented by implementation agents. The current
repository holds the approved high-resolution PNGs in `docs/brand/`; the
recommended SVG exports are future deliverables.

## 12. Compact Brand Mark

The approved compact brand mark is:

**S.**

It is derived directly from the full `SDK.` wordmark and is intended for
compact brand applications where the full wordmark would be too wide.

The compact mark must contain:

- One bold geometric uppercase S
- Exactly one circular period
- No second dot
- No decorative circle
- No status indicator
- No extra punctuation
- No additional symbol

The period is part of the mark and must always remain visually separate from
the S.

**Dark Variant:** background `#082003`, S `#d7e8d3`, single period `#2cdb16`.
**Light Variant:** background `#d7e8d3`, S `#082003`, single period `#2cdb16`.

The compact mark should preserve the same relationship between the letterform
and green period as the full `SDK.` wordmark. Do not recreate the compact mark
using JetBrains Mono or another application font. Use an approved asset.

## 13. Favicon

The official SDK Enterprises favicon is based on the compact `S.` mark. The
favicon must contain exactly: **one S + one green period**. There must never
be two dots.

**Preferred favicon treatment:** canvas/background `#082003`, S `#d7e8d3`,
single circular period `#2cdb16`. A light-background variant may also be
maintained (`#d7e8d3` / `#082003` / `#2cdb16`).

Required favicon sizes: 16×16, 32×32, 48×48, 180×180 Apple touch icon,
192×192, 512×512. The mark should be optically adjusted for very small sizes
if necessary, while preserving its identity.

At small sizes:

- Keep the S bold and readable
- Keep the green period clearly visible
- Do not reduce the period to the point that it disappears
- Do not add details to compensate for small scale
- Do not introduce a second dot
- Do not squeeze the full `SDK.` wordmark into favicon dimensions

**Favicon clear space:** the compact mark should sit comfortably within the
square canvas. Do not let the S or green period touch the canvas edges. Use
consistent optical padding on all sides, with slightly more room on the right
to accommodate the period.

## 14. Compact Mark Incorrect Usage

Never:

- Use `S..`
- Add a second green circle
- Add a decorative dot above, below, or beside the mark
- Use the period as a separate status indicator
- Replace the green period with typographic punctuation
- Remove the period
- Recolor the period
- Use gradients, glows, shadows, or outlines
- Recreate the mark with JetBrains Mono
- Change the relationship between the S and the period
- Place extra text inside the favicon
- Use the full `SDK.` wordmark at unreadably small favicon sizes

The canonical compact identity is always **S.** with exactly one bright-green
circular period.
