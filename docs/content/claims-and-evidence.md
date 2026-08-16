# SDK Enterprises — Claims & Evidence

Single source of truth for what SDK Enterprises may and may not claim publicly.
**Every agent writing marketing copy, case-study material, service copy or legal
text MUST read this document first.** It exists to prevent hallucinated
customers, statistics and outcomes from leaking into the public website.

Applies to: homepage, services, work/case studies, about/process, the enquiry
form and legal pages.

## 1. Verified company facts (real, reusable)

These are the only facts about the company that are real and verified. Use them
verbatim where company identity is needed.

| Fact               | Value                                  | Source of truth         |
| ------------------ | -------------------------------------- | ----------------------- |
| Legal company name | `SADDEK Entreprises`                   | `src/lib/siteConfig.ts` |
| Trading name       | SDK Enterprises                        | `src/lib/siteConfig.ts` |
| SIREN              | `850 513 912`                          | `src/lib/siteConfig.ts` |
| SIRET              | `850 513 912 00020`                    | `src/lib/siteConfig.ts` |
| Registered address | `44 Rue Pasquier, 75008 Paris, France` | `src/lib/siteConfig.ts` |
| Contact email      | `hello@sdk.enterprises`                | `src/lib/siteConfig.ts` |
| Phone              | `+33 6 11 29 92 21`                    | `src/lib/siteConfig.ts` |
| Domain             | `sdk.enterprises`                      | `src/lib/siteConfig.ts` |

Rules:

- **`src/lib/siteConfig.ts` is the single source of truth.** Never re-type
  these values into copy; import them (`import { siteConfig } from "@/lib/siteConfig"`)
  or read the file and copy exactly.
- Do not invent a different legal name, registration number, address or
  incorporation date anywhere else (especially legal pages).

## 2. Fabricated reference content (NEVER appears in copy)

The approved Canva design references in `docs/templates/*.html` are **visual
reference only**. They contain fabricated proof points and personas that do not
represent real SDK work. They must never appear in any copy, in any form:

| Fabricated content                                                                                                                        | Where it lives                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| "600+ applications involved in enterprise cloud migration work"                                                                           | `docs/templates/landing-page-template.html`    |
| Banking case study: "Large-scale migration of internal applications" / "Cloud modernization work across hundreds of banking applications" | `docs/templates/landing-page-template.html`    |
| Telecom case study: "High-volume 5G monitoring platform"                                                                                  | `docs/templates/landing-page-template.html`    |
| Dashboard metrics, personas and amounts (e.g. Marie Dupont, ACME SAS, invoice figures)                                                    | `docs/templates/client-dashboard-example.html` |

If a GasTown bead appears to use any of these, remove it — do not reword it.

## 3. Case-study rule (the critical one)

**There is no verifiable client/project source material in this repository.**
The domains named in the project brief (enterprise cloud/application migration,
realtime 5G systems, high-traffic platforms/APIs, AI engineering, backend
modernization, infrastructure/performance) appear here **only** as the
fabricated placeholders in §2.

Therefore, for any "selected work", "case study" or "engagements" content:

- **Do not** name clients, industries with specific named work, or companies.
- **Do not** claim quantified outcomes (volumes, apps migrated, uptime, savings).
- **Do not** claim specific past engagements as fact, even paraphrased.
- **Do** frame work as scenarios/capabilities the company is set up for —
  see `docs/content/marketing-architecture.md` §5 (Engagements) and §3 (Why SDK).
- **Do** describe technical approach and capability generically when a
  "domains of work" presentation is desired.

Allowed phrasing: "we build X", "we operate Y", "realtime and high-volume
platform work", "we are set up for …".
Not allowed: "we migrated N applications for a bank", "we built a 5G
monitoring platform for a telecom", "we reduced latency by Z% for a client".

This is stricter than the brief's §6 ("if an outcome is not documented,
describe the engineering work without inventing one"). There is nothing
documented, so the outcome descriptions must stay at the capability level.

## 4. Claim hierarchy

| Claim type                                          | Allowed?                                                      | Examples                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Company facts (§1)                                  | Always                                                        | name, SIREN, address, contact                                                                        |
| Capability claims                                   | Allowed                                                       | "we build, modernize and operate software across the stack", service descriptions, technologies used |
| Engagement model                                    | Allowed                                                       | the 01–04 process in `marketing-architecture.md` §6                                                  |
| Positioning claims                                  | Allowed but must be confirmed true by the owner before launch | the "Why SDK" proofs (FR / AI / RT / DIRECT) — see §5                                                |
| Named clients                                       | Never                                                         | —                                                                                                    |
| Quantified outcomes                                 | Never                                                         | —                                                                                                    |
| Testimonials, awards, partnerships, company history | Never                                                         | —                                                                                                    |
| Compliance/legal claims                             | Never unless real                                             | see `docs/content/legal-pages.md`                                                                    |

## 4.1 Owner-confirmed operating model

The owner confirmed the following company model for public positioning:

- SDK Enterprises is the company engaged for project delivery.
- SDK hires independent specialists for projects, including project-specific
  freelance engineers.
- SDK vouches for the quality of the specialists it brings into an engagement.

Allowed public framing: SDK composes a specialist team around the work,
coordinates that team and defines the quality framework presented to the
client. Do not describe independent specialists as employees or imply a fixed
permanent team.

The following details are **not yet documented** and must not be quantified or
claimed as formal guarantees until an operating standard exists:

- network size or availability;
- acceptance or vetting rate;
- universal seniority;
- background, reference or certification checks;
- replacement time if a specialist becomes unavailable;
- a specific review, testing or security process on every engagement.

## 5. Confirmation-before-launch list

The following copy exists in `docs/content/marketing-architecture.md` and may be
used in pages, but each item must be explicitly confirmed as true by the
project owner before the site is shown to clients:

1. "France-based B2B company for European and remote clients."
2. "Senior engineering delivery."
3. "Realtime and high-volume platform work."
4. "You talk to the engineers doing the work, not an account layer."

The operating-model statements in §4.1 are separately owner-confirmed. They do
not confirm any of the four claims above.

These are positioning claims, not statistics. If the owner cannot confirm one,
remove it from the page. Do not soften it into a different claim without
confirmation.

## 6. Technologies are evidence, not the product

Explain the engineering/business problem and the capability first; list the
stack afterwards as proof of depth. A service page that is a keyword list is
wrong even if every keyword is true. See `docs/content/voice-and-standards.md`
§5 and the paste test in §2.

## 7. Related documents

- `docs/content/voice-and-standards.md` — voice, banned phrases, copy review gate
- `docs/content/marketing-architecture.md` — approved section map and draft copy
- `docs/content/site-map.md` — what is built and what to build
- `docs/content/legal-pages.md` — legal page rules
