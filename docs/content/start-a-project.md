# SDK Enterprises — Start a Project (Public Enquiry Form)

Approved design for the B2B project enquiry experience. **Owner-approved
decisions are marked "APPROVED"** and must not be changed without asking the
owner. Everything else is a spec the implementing bead should follow.

## 1. Delivery decision (APPROVED)

Public enquiries are **stored in Postgres AND emailed** to the company inbox:

- A new public `Enquiry` table in the existing Prisma schema (Postgres).
- A transactional email to `hello@sdk.enterprises` via **Resend**
  (new dependency: `resend`; new env var: `RESEND_API_KEY`).

Rationale: the enquiry form must genuinely work (no fake submission); there is
no auth on this form; the existing `Request` model requires a `companyId` and is
for authenticated client companies, so a separate public model is needed.

## 2. Route

- Page: `src/app/(marketing)/start-a-project/page.tsx` (kebab-case directory).
- Keep it in the `(marketing)` route group.
- Add `/start-a-project` to `PUBLIC_ROUTES` in `src/proxy.ts` so it is public.
- Primary nav and header CTA point here ("Start a project").

## 3. Form fields

| Field | Type | Required | Validation |
|---|---|---|---|
| Company | text | yes | 2–255 chars |
| Professional email | email | yes | valid email |
| Company website | URL | no | valid absolute URL if present |
| Capability needed | select (single) | yes | one of: AI Engineering, Software Engineering, Frontend & Product, Cloud & Infrastructure, Data / Cache / Search, Modernization, Other |
| Problem / project description | textarea | yes | 50–4000 chars |
| Existing environment | textarea | no | max 4000 chars |
| Timeline | select (single) | no | ASAP, 1–3 months, 3–6 months, 6+ months, Not sure |
| Budget range | select (single) | no | < €10k, €10k–25k, €25k–50k, €50k+, Not sure |
| Supporting context | textarea | no | max 4000 chars |

Opening copy: **"Tell us what you're trying to build, modernize, automate or fix."**
Follows `docs/content/voice-and-standards.md` (heading communicates an idea,
no banned phrases).

## 4. Validation

- One zod 4 schema shared by server and client, in
  `src/lib/schemas/enquiry.ts` (types live in `src/types/` per conventions;
  `src/lib/schemas/` is the established location pattern for validated inputs).
- Server-side validation is mandatory (route handler / server action).
- Client-side validation mirrors it for UX only — it is not a security control.
- Field labels, error placement and input styling per
  `docs/design/patterns.md` §8 (uppercase labels, `border-muted-foreground` or
  `border-dark/40` inputs for 3:1 contrast, inline messages, no red).

## 5. Submission pipeline (server-side)

Implement in a server-only module, e.g. `src/lib/enquiries.ts`:

1. Accept the zod-validated payload (server action with `"use server"`, or a
   POST route handler — pick one and stay consistent across the codebase).
2. Insert into Postgres using the **existing generated Prisma client**
   (`new PrismaClient()` from `@/generated/prisma/client` — the same pattern as
   `prisma/seed.ts`; use a singleton, do not create a client per request).
3. Send the email via the transport in `src/lib/email.ts`:
   - production: Resend, from `SDK Enterprises <no-reply@sdk.enterprises>`
     to `hello@sdk.enterprises` (`siteConfig.contact.email`), subject
     `New project enquiry — {company}`, body: all submitted fields
     (plain text or minimal HTML, escaped).
   - development: same message, delivered to the **local mail sink**
     (smtp-tester, auto-started by `npm run dev`). Agents verify it with
     `npm run mail:wait "New project enquiry"` or the `maildev` MCP tools — no
     key, no domain, no UI required.
4. Error handling:
   - If the DB insert fails → return an error to the user; do not send email.
   - If the email fails but the DB insert succeeded → return success to the
     user, log the failure server-side, keep the record. Never leak internal
     errors to the client.
   - **Local dev: the sink is the expected delivery target.** No Resend key is
     needed — `npm run mail` receives and displays every sent email. If the
     sink is down, the send fails server-side but the form still succeeds (the
     DB row is the source of truth; email is a notification side effect).

## 6. UI states

- idle → submitting → success | error.
- While submitting: button `disabled`, label unchanged (no spinner —
  `docs/design/patterns.md` §5).
- Success: confirmation copy describing what happens next (SDK replies within
  a clear time window — only claim a window the owner confirms).
- Error: inline field errors + a non-blocking form-level message
  (`docs/design/patterns.md` §8). No error codes in the UI.

## 7. Environment

- Add `RESEND_API_KEY` and `MAIL_SMTP_URL` to `docs/conventions/env.md`
  (server-only table) and the relevant vars to `.env.local`.
- **Local (development):** emails go to the local mail sink (smtp-tester,
  auto-started by `npm run dev`) — check them with `npm run mail:list` or the
  `maildev` MCP tools. No Resend key is required.
  If the sink is down, the form still succeeds — it stores the enquiry and
  logs that the email send failed.
- **Production:** `RESEND_API_KEY` is required for email delivery; its absence
  must fail loudly at send-time with a clear server-side error (the form still
  returns success to the user because the record was stored, per §5).
- The Resend domain (`sdk.enterprises`) must be verified in Resend for
  production delivery.

## 8. `Enquiry` model (proposed)

Add to `prisma/schema.prisma`, create the migration with the
prisma-next-migrations skill, and review the migration before applying.

```prisma
model Enquiry {
  id           String   @id @default(uuid())
  companyName  String   @db.VarChar(255)
  email        String   @db.VarChar(255)
  website      String?  @db.VarChar(1024)
  capability   String   @db.VarChar(255)
  description  String   @db.Text
  environment  String?  @db.Text
  timeline     String?  @db.VarChar(255)
  budgetRange  String?  @db.VarChar(255)
  context      String?  @db.Text
  createdAt    DateTime @default(now())

  @@map("enquiry")
}
```

Notes:

- **No `companyId`** — public enquiries are not client-company resources; the
  resource-isolation model (`docs/architecture/resource-isolation.md`) does not
  apply to this table.
- Do not add fields beyond this set without asking the owner.

## 9. Abuse protection (recommended)

- A hidden honeypot field that, when filled, silently discards the submission.
- Optional basic rate limiting. Do not add a captcha dependency unless the
  owner asks for one.

## 10. Verification (mandatory before the bead is "done")

The form must be verified end-to-end in dev:

1. Submit the form (happy path).
2. Confirm a row is written to the `enquiry` table.
3. Confirm the email lands in the local mail sink (auto-starts with
   `npm run dev`): run `npm run mail:wait "New project enquiry"` — or use the
   `maildev` MCP tools (`list_emails` / `wait_for_email`). No UI needed.
4. Confirm validation errors, the disabled-submit state and the success state
   render correctly.
5. Check responsive + keyboard behavior (44px targets, focus rings) per
   `docs/design/responsive.md` and `docs/design/patterns.md`.

A form that only visually pretends to submit is a failed bead.

## 11. Related documents

- `docs/content/claims-and-evidence.md` — never invent promises about replies
  or outcomes
- `docs/content/legal-pages.md` — the privacy page must describe exactly these
  fields
- `docs/conventions/env.md` — env var documentation
