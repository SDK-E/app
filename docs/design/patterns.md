# SDK Enterprises — Interaction & Feedback Patterns

Shared expectations for interactive and feedback states across the website and
the client portal. Complements `docs/design/design-system.md` (tokens,
surfaces, components). Rendered on `/design-system`.

## 1. Focus states

- Every interactive element shows a visible focus ring: `focus-visible`
  outline, `2px`, offset `2px`.
- On light surfaces the ring is `dark` (`#082003`); on dark surfaces it is
  `brand` (`#2cdb16`) — always the highest-contrast option for the surface.
- Never remove the outline. Keyboard users rely on it.

## 2. Hover

- Links and text buttons: `transition-opacity` → `hover:opacity-70` (restrained).
- Filled buttons (`primary`, `dark`): background shifts `90%` opacity —
  `hover:bg-brand/90`, `hover:bg-dark/90`.
- Outline button: fills with dark, text flips to light.
- No scale, lift, or shadow effects.

## 3. Disabled

- `disabled:pointer-events-none disabled:opacity-50`.
- Never communicate state with color alone on disabled controls; the reduced
  opacity plus inactive pointer is the signal.

## 4. Statuses

| Status                          | Badge tone                             | Meaning                     |
| ------------------------------- | -------------------------------------- | --------------------------- |
| `live` / in progress / on track | `bg-brand text-dark`                   | Active, healthy             |
| `review` / needs attention      | dark outline                           | Human review required       |
| `neutral` / pending             | `line` border, `muted-foreground` text | Waiting, not actionable yet |

- On dark surfaces use the `live` tone as-is and switch `review`/`neutral`
  borders to `#2d4b28` with `light` text.
- There is no red in the palette. Errors are communicated by strong dark text,
  clear wording, and an explicit retry action — not by a new color.

## 5. Loading

- `Skeleton` (`src/components/ui/Skeleton.tsx`): `line` tone at 70%, radius
  `rounded-control`, `animate-pulse`.
- Use skeletons for known structure (rows, panels, metrics). Never show
  placeholder text like "Loading…" alone when the layout is knowable.
- Loading buttons: set `disabled` while pending and keep the label unchanged
  (no spinners unless a process takes multiple seconds).

## 6. Empty states

- `EmptyState` (`src/components/ui/EmptyState.tsx`): paper surface, dashed
  `line` border, centered, title + optional description + optional action.
- Every list/table that can be empty has an empty state. It explains what
  would appear and offers the next action.

## 7. Errors

- `ErrorState` (`src/components/ui/ErrorState.tsx`): paper surface, solid
  `line` border, a `micro` "Error" label, clear title, plain-language
  description, and a recovery action.
- Error copy explains what went wrong in one sentence and what the user can do
  next. No error codes in the UI (log them server-side).

## 8. Forms

- Field labels: `label` size, uppercase, `tracking-eyebrow`, above the input.
- Inputs: `bg-paper`, `1px` border, radius `rounded-control`, body-size text.
  The border must meet a **3:1 contrast** against the surrounding surface — the
  default `line` border is too faint on its own, so use a darker border
  (`border-muted-foreground` or `border-dark/40`) on interactive fields.
- Focus ring per §1 (dark outline on light surfaces).
- Helper text: `muted-foreground`, body size. Validation errors: dark text with a clear
  inline message next to the field; never block the form with a banner alone.

## 9. Navigation

- **Website header:** approved logo asset (`public/brand/sdk-logo-light.png`,
  light-surface variant per `docs/design/brand.md`), 11px uppercase links,
  active section in `brand`, CTA as `dark` button. Mobile: menu button
  toggles a full-width panel (see `src/components/layout/Header.tsx` and
  `docs/design/responsive.md`).
- **Portal sidebar** (not yet built — pattern only): dark surface, wordmark,
  "Client Portal" workspace label, stacked 11px links, active item as
  `bg-brand text-dark`, user block at the bottom separated by a dark border.
  On mobile the sidebar collapses into the header menu pattern.

## 10. Motion

- Only what the system defines: focus transitions, hover opacity/background,
  skeleton pulse, menu panel open/close. No entrance animations, parallax,
  marquees or floating elements.
- Respect `prefers-reduced-motion`: disable transitions and the pulse.
