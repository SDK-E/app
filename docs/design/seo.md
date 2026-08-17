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

- JSON-LD for Organization, WebPage, BreadcrumbList
- Validate with Google Rich Results Test

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
