# SEO & PageSpeed Guardrails

## Core Web Vitals

- LCP < 2.5s (Largest Contentful Paint)
- FID < 100ms (First Input Delay)
- CLS < 0.1 (Cumulative Layout Shift)

## Image Optimization

- Use Next.js `<Image>` component (auto-optimization)
- Serve WebP/AVIF formats
- Lazy load below-fold images
- Set explicit width/height (prevent CLS)

## Font Optimization

- Use `next/font` (auto-preload, FOUT prevention)
- Subset fonts (only needed characters)
- Preload critical fonts

## Caching

- Static pages: `Cache-Control: public, max-age=31536000, immutable`
- API routes: `Cache-Control: no-store` (or appropriate TTL)
- ISR pages: revalidate via `revalidate` export

## Structured Data

- JSON-LD for Organization, WebSite, BreadcrumbList, and page-specific types
  (AboutPage, ContactPage, ProfessionalService, CollectionPage).
- `sameAs` populated from env vars: `NEXT_PUBLIC_SOCIAL_LINKEDIN_URL`,
  `NEXT_PUBLIC_SOCIAL_GITHUB_URL`. Omit X/Twitter links.
- Validate with Google Rich Results Test
- Each page's `generateMetadata` returns a JSON-LD array in `other["script:ld+json"]`

## AI-readiness

- `llms.txt` at `/llms.txt` — Markdown index with all public pages (all locales),
  one-line descriptions, and links to `.md` fallback versions.
- `/[locale]/index.md` route — serves clean Markdown on `Accept: text/markdown`,
  with `Link` headers for canonical + hreflang.
- `robots.txt` Content Signals: `ai-train=allow`, `search=yes`, `ai-input=allow`.
- AI crawler rules: explicitly allowed (GPTBot, Google-Extended, CCBot) with the
  same disallow paths as general crawlers.
- `security.txt` and `humans.txt` at `/.well-known/` — standard discovery artifacts.

## Meta Tags

- `title` per page (unique, < 60 chars)
- `description` per page (unique, < 160 chars)
- OpenGraph tags for social sharing
- Canonical URLs

## Public Routes

All public routes must be in `PUBLIC_ROUTES` in `src/proxy.ts`.

## Voice & Content

Follow `docs/content/voice-and-standards.md` for copy quality.
Claims must follow `docs/content/claims-and-evidence.md`.
