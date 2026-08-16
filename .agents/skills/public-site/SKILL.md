---
name: public-site
description: Public website SEO and PageSpeed guardrails for SDK Enterprises. Use ONLY when working on public-facing routes, layouts, components, metadata, sitemap, robots, hreflang, images, fonts, structured data, JSON-LD, or Core Web Vitals. Non-negotiable; follow both Use and Do NOT use lists.
---

# Public SEO and PageSpeed guardrails

Apply to every public-facing route, layout, component, image, translation, and content change. Target: Lighthouse score of 100 for SEO, Performance, Accessibility, and Best Practices on both mobile and desktop.

## Use

- Read `src/lib/seo.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/i18n.ts`, and the relevant route before changing SEO. Reuse existing typed helpers and `siteConfig`; do not create parallel metadata utilities.
- Keep indexable content in Server Components and render meaningful text, headings, links, and structured data in the initial HTML response. Add `"use client"` only to the smallest interactive leaf.
- Give every indexable page a unique, accurate, localized `title` and meta description through Next.js `Metadata` or `generateMetadata`. Keep the visible primary heading and metadata aligned with the page's real purpose.
- Use one clear primary `h1`, then a logical heading hierarchy without skipping levels. Use semantic landmarks (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`) and valid HTML.
- Set `metadataBase`, one absolute self-referencing canonical URL, and Open Graph/Twitter metadata with an approved 1200px social image and accurate alt text. Canonical URLs must use the production origin and normalized route.
- Provide reciprocal `alternates.languages` entries only for real translated equivalents. Include every available equivalent locale plus `x-default`; never point `hreflang` at a fallback, untranslated, redirected, or missing page. Keep `<html lang>`, canonical, metadata locale, and page copy aligned.
- Add every indexable public URL to `src/app/sitemap.ts`, including its real locale alternates. Include only canonical URLs that return `200`. Set `lastModified` from a real content-change value; omit it when no truthful value exists. Keep private, auth, error, `noindex`, and redirect URLs out.
- Keep `src/app/robots.ts` permissive for public pages and block private or operational areas. Use metadata `noindex` for pages that must not appear in search while remaining crawlable; confirm that robots.txt does not prevent Google from seeing that directive.
- Return meaningful HTTP status codes. Use `notFound()` for missing resources, permanent redirects for lasting URL moves, and redirects only to the final canonical destination. Verify that error pages do not return a soft `200`.
- Use `next/link` or a real `<a href>` for navigation. Write concise, descriptive anchor text that makes sense out of context and ensure every public page is reachable through crawlable internal links.
- Add JSON-LD only for a Google-supported schema that describes visible, verified content on that exact page. Generate it from trusted typed data, use absolute canonical URLs, serialize it safely, and validate it with Google's Rich Results Test. Breadcrumb data must match visible navigation.
- Write useful, original copy for the user's intent. Follow `docs/content/voice-and-standards.md` and `docs/content/claims-and-evidence.md`; use natural terminology, answer the page's real question, and link related pages where it helps the reader.
- Use `next/image` for content images. Supply intrinsic dimensions or a stable `fill` container, an accurate `sizes` value, and meaningful `alt` text; use empty alt text for purely decorative images. Optimize source dimensions and modern formats. Preload only the actual LCP image and lazy-load below-fold media.
- Use the existing `next/font` setup, load only required subsets/weights, and preserve stable fallback metrics. Reserve dimensions for images, embeds, banners, and asynchronous content so layout does not shift.
- Keep the critical rendering path small: prefer Server Components, remove unused JavaScript/CSS, split genuinely heavy interactive UI, cache repeated server work appropriately, avoid request waterfalls, and defer non-critical scripts. Use `next/script` with the least-blocking valid strategy.
- Preserve content and metadata parity at every responsive width. Ensure text is legible, controls have accessible names and touch targets, focus is visible, color contrast passes, and mobile content is not removed merely to improve a score.
- Meet Core Web Vitals in field data at the 75th percentile on mobile and desktop: LCP <= 2.5s, INP <= 200ms, and CLS <= 0.1. Treat lab results as a diagnostic signal and field results as the user-experience source of truth.
- Before completion, run the normal code checks and a production build. Audit representative public pages in Lighthouse/PageSpeed on mobile and desktop; inspect rendered HTML, status, canonical, robots, `hreflang`, structured data, sitemap membership, crawlable links, console errors, and broken assets. Record any score below 100 and fix repository-controlled failures before calling the work complete.

## Do NOT use

- Do not promise rankings, traffic, rich results, indexing speed, or a permanent 100 PageSpeed score. Do not claim 100 without a saved result from the tested production or production-equivalent URL and configuration.
- Do not add duplicate, generic, misleading, keyword-stuffed, or empty titles and descriptions. Do not use the obsolete `keywords` meta tag as an SEO strategy, and do not repeat location/service variants to manufacture pages.
- Do not hide keywords or links, cloak content, create doorway pages, publish scraped/thin/near-duplicate copy, or write for crawlers instead of people.
- Do not invent claims, reviews, ratings, FAQs, authors, dates, locations, clients, outcomes, or business facts for copy or structured data. Do not add schema for content or functionality that is not visible and real.
- Do not emit multiple/conflicting canonicals, canonicalize every locale to English, point canonical or `hreflang` to redirects/errors, or index URL fragments and tracking/query variants as separate content.
- Do not put private, authenticated, design-system, search-result, error, duplicate, redirected, or `noindex` URLs in the sitemap. Do not use a fresh build time as `lastModified` when content did not change.
- Do not use robots.txt as a substitute for `noindex`, and do not block an indexable page or its essential CSS, JavaScript, images, or fonts from crawlers. Never expose private content merely to make it crawlable.
- Do not render critical public copy, navigation, metadata, or links only after client-side JavaScript, authentication, consent, scrolling, hovering, or a user action. Do not use `onClick`, `<span>`, or `javascript:` as navigation.
- Do not return `200` for missing/error content, create redirect chains or loops, use temporary redirects for permanent moves, or change a public URL without redirects plus canonical/sitemap/internal-link updates.
- Do not use raw `<img>` for content images, omit dimensions or `sizes`, lazy load the LCP image, preload several competing images, eagerly load all below-fold media, or use generic alt text such as "image" or filename text.
- Do not load fonts through CSS `@import` or remote `<link>` tags, import the same font separately in components, or load unused families, subsets, weights, and styles.
- Do not add blocking third-party scripts, autoplay media, heavy embeds, trackers, tag managers, chat widgets, or new dependencies without a proven user requirement and measured PageSpeed impact. Never place non-critical scripts in the critical path.
- Do not sacrifice accessibility, content completeness, security, privacy, analytics correctness, or responsive behavior to game Lighthouse. Do not weaken a failing audit, skip representative mobile routes, or treat one warm local run as production evidence.
