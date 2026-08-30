---
name: i18n
description: >
  Internationalization for SDK Enterprises. Use when adding or editing
  translations, routing, or locale-aware UI in this repo — new strings,
  locale files, legal pages, marketing components, middleware behavior,
  or next-intl patterns.
metadata:
  author: sdk-enterprises
  version: "1.0.0"
---

# i18n (SDK Enterprises)

next-intl v4 with Next.js 16 App Router. 17 European locales: `en, fr, de, es, pt, it, nl, sv, no, da, fi, pl, cs, hu, ro, bg, el`.

## Source of truth

- `packages/i18n/src/index.ts` — locale list (`en, fr, de, es, pt, it, nl, sv, no, da, fi, pl, cs, hu, ro, bg, el`), default locale (`en`).
- `packages/i18n/src/i18n/routing.ts` — `defineRouting` config (locales, `defaultLocale`, prefix strategy).
- `apps/web/src/proxy.ts` — locale-prefix middleware (excludes `/auth/*`).
- `packages/i18n/src/locales/{locale}/**/*.json` — feature-oriented translation catalogs.
- `docs/conventions/structure.md` — directory layout and route conventions.

## Adding a new translation key

1. Add the key to the appropriate file under `src/locales/en/` (English file paths, keys, nesting, and key order are the source of truth).
2. Run `pnpm run i18n:translate`. The incremental translator updates only strings whose English source was added or changed, across all 16 targets.
3. Review the generated copy in context. Machine translation is a first pass, especially for legal, marketing, and idiomatic copy; never treat successful execution alone as linguistic approval.
4. Run `pnpm run i18n:check` to verify JSON shape, keys, arrays, interpolation variables, and the absence of placeholders or leaked preservation markers.
5. Use `getTranslations({ locale, namespace })` in server components.
6. Use `useTranslations(namespace)` in client components.

## Translation commands

```bash
pnpm i18n:translate                 # all locales, changed English only
pnpm i18n:translate -- fr de        # selected locales, changed English only
pnpm i18n:translate -- --all fr     # deliberately regenerate all French
pnpm i18n:check                     # offline validation, no writes
```

The script is `packages/tooling/i18n/translate-locales.py`; its per-locale English baseline is `packages/i18n/src/locales/.translation-state.json`. It recursively mirrors English files, adds missing target files and keys, orders nested keys like English, and removes target files or keys that no longer exist in English. Commit both the updated catalogs and baseline after review. Never hand-write `[TRANSLATE:...]` placeholders.

## Translation + SEO parity gate

After running `pnpm i18n:translate`:

1. **Machine-translation review** — Review all translated marketing and legal copy in context. Machine translation is a first pass; never treat successful execution alone as linguistic approval. Legal copy (`legal.*`) is especially sensitive — verify factual accuracy and tone.
2. **SEO parity** — Every localized page must have a matching `hreflang` alternate entry in `generateMetadata`/`buildMetadata` for all 17 locales plus `x-default`. Canonical URLs must be absolute and resolve with HTTP 200. Use the shared `buildMetadata` helper rather than hand-writing `<link rel="alternate">`.
3. Run `pnpm run verify` (lint, typecheck, i18n:check, build — warnings = fail).

## Catalog layout

- `shared.json` — `meta`, `nav`, `footer`, `auth`, `errors`.
- `home.json` — homepage namespaces: `hero`, `services`, `whySdk`, `engagements`, `process`, `contact`.
- `enquiry.json` — `enquiry`.
- `design-system.json` — `designSystem`.
- `pages/{route}.json` — one public page namespace per file.
- `legal/{document}.json` — one legal document per file.

Every shard retains its full next-intl namespace wrapper. Components continue to use namespaces such as `servicesPage`, `enquiry`, and `legal.privacy`; file boundaries never become part of a translation key.

The translator protects next-intl `{variables}`, SDK Enterprises, processor names, legal identifiers, URLs, and technology/product names. If new copy adds a proper noun or identifier that must stay verbatim, add it to the script's protected terms before translating.

## Component conventions

- Server components by default; `"use client"` only when interactivity requires it.
- Pass `locale` as a prop from pages to marketing/legal components.
- Legal pages are single-language per locale: FR locale renders `fr` section, all other locales render `en` section.
- Marketing components use `getTranslations` with `locale` prop.
- Header accepts `locale` prop to render the `LanguageSwitcher`.

## Legal content rules

- French text under `packages/i18n/src/locales/fr/legal/` is authoritative for legal pages.
- English text in `packages/i18n/src/locales/en/` is the source for other locales.
- No bilingual sections on legal pages.
- Processors must be listed verbatim: Vercel, Auth0 (Okta), Resend, Prisma Postgres.

## Proxy routing

- `apps/web/src/proxy.ts` strips the locale prefix before matching routes.
- `/auth/*` is excluded from locale prefixing (Auth0 boundary).
- All other public routes are locale-prefixed (e.g., `/en/login`, `/fr/mentions-legales`).

## Build verification

```bash
pnpm run i18n:check && pnpm run verify
```
