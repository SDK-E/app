# SDK Enterprises — Marketing Content Architecture

Section map and **first-pass (DRAFT)** copy for the public website. Written to
`docs/content/voice-and-standards.md`. The approved Canva reference
(`docs/templates/landing-page-template.html`) defines the section rhythm and
much of the specific copy; where the reference fabricates proof points, this
document replaces them with honest positioning claims.

> **Status: BEING REVISED.** The homepage map below remains the current
> foundation. Dedicated Services, Work, How we work, About and Start a project
> pages are being redesigned around the owner-confirmed operating model in
> `claims-and-evidence.md` §4.1 and must pass the copy review gate
> (voice-and-standards.md §6) before any page implementation treats it as
> final. Claim rules: `docs/content/claims-and-evidence.md`. Page inventory and
> current state: `docs/content/site-map.md`. The homepage sections below are
> implemented at `src/app/(marketing)/page.tsx` using the shared sections in
> `src/components/marketing/`; dedicated `/services`, `/work`, `/about`,
> `/how-we-work` and `/start-a-project` pages build on them.

## Section map

| #   | Section      | Answers                                | Surface |
| --- | ------------ | -------------------------------------- | ------- |
| 1   | Header / nav | What SDK does at a glance              | light   |
| 2   | Hero         | What does SDK do? What's in it for me? | light   |
| 3   | Services     | What problems does SDK solve?          | light   |
| 4   | Why SDK      | Why should they trust SDK?             | dark    |
| 5   | Engagements  | When would someone hire SDK?           | light   |
| 6   | Process      | What happens next? How does it work?   | light   |
| 7   | Contact      | What happens next?                     | brand   |
| 8   | Footer       | Legals + one-line identity             | dark    |

## 1. Header / nav

- Wordmark: **SDK.** (green dot)
- Nav: Services · Work · Process · About
- CTA: **Discuss a project →** (dark button)

_Notes: "About" currently has no dedicated section; map it to the contact/company
band in the reference. Revisit when the site is assembled._

## 2. Hero

**Purpose:** What does SDK do? What's in it for the reader?

- Eyebrow: `B2B AI · Software · Cloud · Systems Engineering`
- Heading (display): **One engineering partner for the stack your company needs.**
- Lead: SDK Enterprises builds, modernizes and operates software across the
  stack — backend platforms, cloud infrastructure, AI automation, realtime
  systems and internal tooling. You engage on one specialized problem or own a
  broader workstream; either way, the people doing the work are the people you
  talk to.
- Primary CTA: **Start a project →**
- Secondary CTA: **Explore services**
- Trust row: France-based B2B company · Senior engineering delivery · AI +
  backend + cloud · European & remote clients

_Notes: reference copy retained — it is specific and passes the paste test.
Lead slightly expanded with the "same people you talk to" positioning._

## 3. Services

**Purpose:** What problems does SDK solve?

- Eyebrow: `Services`
- Heading (title): **Use all of the stack — or only the part you need.**
- Intro: SDK can engage on one specialized problem or own a broader technical
  workstream.

Cards (six):

| #   | Service        | Copy                                                                                                                       |
| --- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 01  | AI engineering | AI agents & automation — LLM integrations, agents, RAG, workflow automation, developer tooling and AI-assisted operations. |
| 02  | Backend        | Platforms, APIs & SaaS — PHP, Laravel, Symfony, Java, Spring Boot, Node.js, APIs and realtime backend architecture.        |
| 03  | Frontend       | Web & application interfaces — React, Vue, Nuxt, TypeScript, Tailwind and Shadcn.                                          |
| 04  | Cloud          | Cloud & infrastructure — AWS, GCP, Azure, Kubernetes, Helm, CI/CD and deployment architecture.                             |
| 05  | Data           | Databases, cache & search — PostgreSQL, MySQL, MongoDB, Redis, Valkey and Elasticsearch.                                   |
| 06  | Modernization  | Legacy modernization — framework upgrades, migration, technical debt reduction and performance optimization.               |

_Notes: technologies are listed as evidence after the capability. Reference
copy is specific and retained._

## 4. Why SDK

**Purpose:** Why should they trust SDK?

- Eyebrow: `Why SDK`
- Heading (title): **Senior engineering without unnecessary layers.**
- Intro: Direct communication, fast diagnosis and pragmatic execution.

Proof points (replaced the reference's fabricated "600+" and case-study
claims with honest positioning claims):

- **FR** — A France-based B2B company for European and remote clients.
- **AI** — LLM integrations, agents, automation and internal tooling.
- **RT** — Realtime and high-volume platform work.
- **DIRECT** — You talk to the engineers doing the work, not an account layer.

_Notes: all four are capability/positioning claims — no invented statistics.
Each must be confirmed as true before launch (voice-and-standards §5)._

## 5. Engagements

**Purpose:** When would someone hire SDK? (Replaces the reference's fabricated
"Selected work" case studies.)

- Eyebrow: `Work with SDK`
- Heading (title): **Bring a specific problem. Get a specific answer.**
- Intro: You know when something in your stack is costing you. Here are the
  situations SDK is set up for.

Scenarios (four):

| #   | Scenario                                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | **A system too old to keep patching.** You need a migration plan, not a wish — an audit of what runs, what breaks, and the order to move in. |
| 02  | **Volume your current stack wasn't built for.** Realtime ingestion, high-throughput backends and the infrastructure to keep them stable.     |
| 03  | **AI you can put to work.** LLM integrations, agents and automation that change an internal workflow — not a demo that stops at the pitch.   |
| 04  | **A team that needs senior hands.** Direct engineering delivery on your codebase, without a middle layer slowing decisions.                  |

_Notes: scenario-based, no invented customers or outcomes. Keep the section
only if the four scenarios hold up in review._

## 6. Process

**Purpose:** What happens next? How does work get done?

- Eyebrow: `How we work`
- Heading (title): **A clear path from problem to production.**
- Intro: (optional) Four steps, visible progress at every stage.

Steps:

| #   | Step                                                                 |
| --- | -------------------------------------------------------------------- |
| 01  | Understand — business goal, stack, constraints and success criteria. |
| 02  | Design — architecture, scope, risks and milestones.                  |
| 03  | Build — implementation with visible progress.                        |
| 04  | Handover — deploy, document and transfer ownership.                  |

_Notes: reference copy retained._

## 7. Contact

**Purpose:** What happens next?

- Eyebrow: `Work with SDK`
- Heading (title): **Bring us the problem you need solved.**
- Body: Tell us what you're trying to build, modernize, automate or fix —
  we'll tell you honestly whether it's a fit and what it would take.
- Contact details: SDK Enterprises · registered under SADDEK Entreprises ·
  SIREN 850 513 912 · SIRET 850 513 912 00020 · hello@sdk.enterprises ·
  +33 6 11 29 92 21 · 44 Rue Pasquier, 75008 Paris, France · sdk.enterprises

_Notes: company details are real and verified. Reference copy retained and
extended with the "tell us what you're trying to build" line._

## 8. Footer

- `© SDK Enterprises` · `AI · Software · Cloud · Systems Engineering`

## Review checklist

Run `docs/content/voice-and-standards.md` §6 over this document before page
implementation:

- [ ] Paste test passes for every sentence
- [ ] No banned phrases (grep §2 list)
- [ ] No fabricated claims; every claim verified or removed
- [ ] Every heading communicates an idea
- [ ] Every section answers its declared purpose question
- [ ] Tone, terms and capitalization consistent

## Dedicated-page positioning (2026 redesign)

The dedicated pages use a more specific commercial narrative than the compact
homepage sections:

1. The client brings a technically consequential system, constraint or
   decision.
2. SDK determines which engineering capability the work requires.
3. SDK composes and coordinates independent specialists around that need.
4. Decisions, risks, progress and quality controls remain visible.
5. Code, infrastructure, documentation and operating knowledge remain under
   client control where the engagement scope permits.

This is company positioning, not permission to invent a permanent team,
formal vetting statistics, clients, outcomes or universal delivery guarantees.
