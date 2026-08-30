# SDK Enterprises — Legal Pages

Requirements and rules for the public legal pages (privacy, terms, cookies,
mentions légales). The company is a French legal entity, so French law applies.
**Do not invent legal text, compliance claims or legal entity details.**

## 1. Required pages

| Page                    | Why it is required                                                                                         | Suggested route           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------- |
| Mentions légales        | Legally required for any website operated from France (LCEN, art. 6-III)                                   | `/legal/mentions-legales` |
| Privacy policy (RGPD)   | Required by GDPR arts. 12–14 whenever personal data is processed — the enquiry form collects personal data | `/privacy`                |
| Cookie policy + consent | Required only if tracking/storage cookies are set                                                          | `/cookies`                |
| Terms of use            | Not legally mandatory for this site type, but recommended for B2B                                          | `/terms`                  |

Use `kebab-case` route directories per `docs/conventions/structure.md`.

The site copy is English. Legal pages are **bilingual (French + English)**
(owner-approved 2026-08-15): each page shows FR and EN blocks with in-page
language links; the French legal name, SIREN/SIRET and address appear verbatim
in both languages.

## 2. Content that is allowed (real and verifiable)

- Company identity from `src/lib/siteConfig.ts` (single source of truth):
  legal name `SADDEK Entreprises`, trading name SDK Enterprises,
  SIREN `850 513 912`, SIRET `850 513 912 00020`,
  address `44 Rue Pasquier, 75008 Paris, France`.
- Contact details: `hello@sdk.enterprises`, `+33 6 11 29 92 21`.
- Data controller: `SADDEK Entreprises` (address as above).
- Data the enquiry form collects — the exact fields listed in
  `docs/content/start-a-project.md`. Nothing else.
- The actual services used to operate the site, where they are genuinely in
  the stack: **Vercel** (hosting), **Auth0** (authentication), **Resend**
  (transactional email for enquiries), the **Postgres** provider (from
  `DATABASE_URL`), **Vercel Analytics** (analytics), **SecurePrivacy**
  (consent management), **Google Analytics** and **Google Tag Manager**
  (consent-gated audience analytics). Do not list any provider that is not
  actually used.

## 3. Content that is forbidden

- **No CNIL registration or declaration number** unless one really exists and
  is supplied by the owner. Do not invent one.
- **No blanket compliance claims** such as "fully GDPR-compliant" or "ISO
  certified" unless real and documented.
- **No invented processors, sub-processors or hosting addresses.** For Vercel's
  legal identity/address, verify the current value from vercel.com/legal before
  publishing — do not guess. The same applies to any provider.
- **No invented retention periods, data categories, or consent mechanics**
  beyond what the code actually does.
- **No fabricated case studies, metrics or testimonials** — see
  `docs/content/claims-and-evidence.md`.

## 4. Cookie guidance

- Vercel Analytics is cookieless by default. If the site sets no tracking
  cookies, the cookie page documents that fact and a consent banner is not
  technically required — but the decision (and any banner implementation)
  belongs to the owner. Do not build a consent banner that implies a cookie
  processing architecture the site does not have.
- If any cookie-setting script is added, it must be listed on the cookie page.
- **Decision (owner-approved 2026-08-15): no banner.** The site sets no
  tracking cookies; the cookie page states this and the trigger condition
  (any cookie-setting script added ⇒ consent banner becomes required, per CNIL
  guidance / ePrivacy Art. 5.3). Do not build a banner unless that changes.
- **Decision (owner-approved 2026-08-30): the SecurePrivacy consent-management
  platform is now loaded on every page (cookies/consent install).** This
  reverses the no-banner decision above: the site now shows a consent banner
  via SecurePrivacy and stores the visitor's consent choice in the browser.
  The cookie page, privacy processors list, and this document were updated in
  that commit; the revised legal pages require re-review under §5.
- **Google Analytics and Google Tag Manager are consent-gated (2026-08-30).**
  The GA tag and the GTM container never load until the visitor accepts the
  analytics service in the SecurePrivacy banner; the loader in
  `apps/web/src/components/analytics/GoogleAnalyticsConsent.tsx` waits for the
  `sp_unblock_Google_Analytics` / `sp_unblock_Google_Tag_Manager` events (or
  `sp.checkConsent`) before injecting gtag.js / gtm.js. The service names must
  stay in sync between the SecurePrivacy dashboard Scan Report and
  `siteConfig.analytics.securePrivacyServiceName` /
  `siteConfig.analytics.securePrivacyGtmServiceName`. GA4 and GTM load
  side-by-side; do not duplicate the `G-DDSKTR68M7` GA4 tag inside the GTM
  container or pageviews count twice.

## 5. Review gate (mandatory)

Legal pages **must be reviewed by the project owner — and ideally by a
professional — before the site is shown publicly.** The batch must not declare
legal pages "done" without that review.

Until review happens:

- Add a clear code comment and/or a low-key page note: "Legal text pending
  owner review."
- Do not state compliance facts that the code does not back up.

**Status (2026-08-15): owner-approved. Review notes removed from pages; code
comments and checklist updated to reflect approval. Professional review still
recommended before public launch if the owner wants a second legal opinion.**

**Status (2026-08-30): owner re-approved.** The cookie/privacy revisions that
introduced the SecurePrivacy consent banner were reviewed and accepted by the
owner. The professional-review recommendation above still stands.

This satisfies the project brief's requirement to make professional/legal
review explicit.

## 6. Footer

Add links to `/legal/mentions-legales`, `/privacy`, `/terms`, `/cookies` in
the site footer (see `src/components/marketing/SiteFooter.tsx`).

## 7. Related documents

- `docs/content/claims-and-evidence.md` — verified company facts (§1)
- `docs/content/start-a-project.md` — the data the privacy page must describe

## 8. Built pages

Implemented under `src/app/(marketing)/` with a shared shell
(`src/components/marketing/LegalPage.tsx`) and typographic primitives
(`src/components/marketing/LegalText.tsx`):

| Page                  | Route                     | Notes                                                                  |
| --------------------- | ------------------------- | ---------------------------------------------------------------------- |
| Mentions légales      | `/legal/mentions-legales` | Publisher identity, LCEN art. 6-III.                                   |
| Privacy policy (RGPD) | `/privacy`                | Controller, data from the enquiry form, bases, processors, rights.     |
| Cookie policy         | `/cookies`                | SecurePrivacy consent banner; CMP stores the visitor's consent choice. |
| Terms of use          | `/terms`                  | B2B terms, French law.                                                 |

All four are added to `PUBLIC_ROUTES` in `src/proxy.ts` and linked in the site
footer (`src/components/marketing/SiteFooter.tsx`).

Owner-only values, now provided and owner-approved (2026-08-30):

- Legal form and share capital: Auto-entrepreneur (sole trader,
  micro-entreprise), no share capital.
- Publication director: Hicham SADDEK.
- Retention period: 12 months from last contact (also approved 2026-08-15).
- Derived/verified values, owner-confirmed: RCS entry
  (`RCS Paris 850 513 912`, derived from the verified SIREN + registered
  address) and the Vercel host address
  (`440 N Barranca Ave #4133, Covina, CA 91723, US`, as stated on
  vercel.com/legal/terms).

## 9. France / GDPR requirements checklist

Everything considered while drafting. Each item shows status and where it is
covered. Keep this list in sync when the site changes.

| Requirement                                                                    | Status                                                                                                                                       | Where covered                 |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Mentions légales (LCEN art. 6-III)                                             | Approved on page                                                                                                                             | `/legal/mentions-legales`     |
| Publisher identity (name, SIREN/SIRET, address, contact)                       | Done                                                                                                                                         | siteConfig → mentions légales |
| RCS number + legal form + share capital                                        | **Done** — RCS Paris 850 513 912 (derived from SIREN, owner-confirmed); form + capital: Auto-entrepreneur, no share capital (owner-provided) | mentions légales              |
| Publication director                                                           | **Done** — Hicham SADDEK (owner-provided)                                                                                                    | mentions légales              |
| Host identity (Vercel) + registered address                                    | **Done** — 440 N Barranca Ave #4133, Covina, CA 91723, US (vercel.com/legal/terms)                                                           | mentions légales              |
| Privacy policy (RGPD arts. 12–14: controller, data, bases, recipients, rights) | Approved on page                                                                                                                             | `/privacy`                    |
| Retention period for enquiry data                                              | **12 months** from last contact (owner-approved 2026-08-15)                                                                                  | `/privacy`                    |
| Data-subject rights (arts. 15–22) incl. CNIL complaint                         | Covered                                                                                                                                      | `/privacy`                    |
| Lawful bases (6.1.b pre-contractual, 6.1.f legitimate interest, 6.1.c legal)   | Covered                                                                                                                                      | `/privacy`                    |
| Register of processing activities (art. 30)                                    | Owner task — internal, not a page                                                                                                            | stated on `/privacy`          |
| Cookie consent (ePrivacy art. 5.3 + CNIL guidance)                             | **Covered** — SecurePrivacy banner (owner decision 2026-08-30; reverses the 2026-08-15 no-banner decision)                                   | `/cookies`                    |
| Data-breach notification (arts. 33–34, CNIL 72h)                               | Owner task — internal procedure                                                                                                              | not published                 |
| International transfers (arts. 44–49, SCCs)                                    | Covered + owner confirmation flagged                                                                                                         | `/privacy`                    |
| Children (art. 8)                                                              | Covered                                                                                                                                      | `/privacy`                    |
| DPO designation (arts. 37–39)                                                  | Not required at this scale; contact email used                                                                                               | `/privacy`                    |
| No automated decision-making / profiling                                       | Covered                                                                                                                                      | `/privacy`                    |
| CNIL declaration number                                                        | None claimed, none invented                                                                                                                  | `/privacy`                    |
| Terms of use (optional, recommended B2B)                                       | Approved draft on page                                                                                                                       | `/terms`                      |
| Legal language                                                                 | Bilingual FR/EN (owner decision)                                                                                                             | all pages                     |
| Review gate                                                                    | **Done** — owner-approved 2026-08-15, re-approved 2026-08-30; professional review still recommended before public launch                     | §5                            |
