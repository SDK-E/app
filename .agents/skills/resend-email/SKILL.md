---
name: resend-email
description: >
  Send transactional email for the public "Start a project" enquiry in this
  repo. Use when writing or editing the enquiry form pipeline (server action /
  route handler), sending an email from a Next.js server module, verifying the
  sdk.enterprises sending domain, seeing dev emails in the local mail sink, or
  debugging "email won't send". Covers the `resend` package, the
  `RESEND_API_KEY` and `MAIL_SMTP_URL` env vars, and the `{ data, error }`
  result contract.
metadata:
  author: sdk-enterprises
  version: "2.0.0"
---

# Resend Email (SDK Enterprises)

Sending transactional email in this repo. The only approved use today is the public project-enquiry notification defined in `docs/content/start-a-project.md` (Postgres `Enquiry` row + email to the company inbox). The email is a side effect of a DB write — never send without writing the record first.

## 0. Non-negotiables

- **Server-only.** The `resend` and `nodemailer` packages and their env vars must never be imported or referenced from a client component. Send from a server action or route handler. The established transport is `src/lib/email.ts` (`sendEnquiryNotification`); the enquiry orchestration (DB insert + transport) belongs in `src/lib/enquiries.ts`.
- **Never log or print the API key or the full error object** (Resend errors may echo request payloads). Log a stable identifier + message only.
- **Read env through `getServerEnv()`**, never `process.env` directly.
- **Sender must be on a verified domain.** `from` must use `sdk.enterprises` in production; see §3.
- In dev, emails are delivered to the **local mail sink** (`scripts/mail-sink.ts`, smtp-tester), never through Resend — see §5.

## 1. Install

All dependencies are installed once (already part of the approved start-a-project spec):

```bash
pnpm add resend              # production transport
pnpm add -D smtp-tester nodemailer @types/nodemailer   # local dev sink
```

`nodemailer` is dev-only and lazy-imported; it is never bundled for production.

## 2. The env vars

- `RESEND_API_KEY` — server-only, required in production. Optional in dev (dev uses the local sink and never reads the key).
- `MAIL_SMTP_URL` — dev-only SMTP URL of the local sink, defaults to `smtp://localhost:1025`.

Both are documented in `docs/conventions/env.md` and validated in the zod schema in `src/lib/env.ts`. Never hardcode a key anywhere.

## 3. Domain verification (production)

In the Resend dashboard, add the `sdk.enterprises` domain and complete the DNS verification steps Resend provides (SPF/DKIM). Until verified, any `from` on `sdk.enterprises` fails. Production sends must not be attempted on an unverified domain.

## 4. Sending (production path)

The SDK returns `{ data, error }` — destructure it; do not assume the promise rejects on a send failure. The established transport handles the detail:

```ts
import { sendEnquiryNotification } from "@/lib/email";

const ok = await sendEnquiryNotification(enquiry);
// ok === false  →  logged server-side; form must still succeed (record stored)
```

Guidelines:

- **From:** `SDK Enterprises <no-reply@sdk.enterprises>` — derived from `siteConfig.contact.domain`.
- **To:** `hello@sdk.enterprises` (`siteConfig.contact.email`).
- **Subject:** `New project enquiry — {company}`.
- All user-supplied fields are untrusted: escaped before rendering into HTML (handled in `src/lib/email.ts`).
- Per `docs/content/start-a-project.md`: DB insert first; only if the insert succeeds, send email. If email fails but the insert succeeded, return success to the user and log server-side. If the insert fails, do not send.

## 5. Development behavior (local sink)

- **In dev, emails are delivered to the local mail sink** (`scripts/mail-sink.ts`, smtp-tester), not Resend. This lets agents see every enquiry email the form sends without a Resend key or a verified domain.
- **No setup:** the sink auto-starts with `pnpm run dev` (SMTP on `localhost:1025`). Run it standalone with `pnpm dlx @sdk-e/mailbox`.
- **Checking mail:** open the local inbox UI — `pnpm dlx @sdk-e/mailbox open` (serves `http://localhost:1080`, loopback only, while the sink runs) — or use the CLI — `pnpm dlx @sdk-e/mailbox list`, `pnpm dlx @sdk-e/mailbox read -- <id>`, `pnpm dlx @sdk-e/mailbox clear` — or the `maildev` MCP server tools (`list_emails`, `read_email`, `clear_emails`, `wait_for_email`).
- `sendEnquiryNotification` sends to `MAIL_SMTP_URL` (default `smtp://localhost:1025`) whenever `NODE_ENV !== "production"`.
- If the sink is down, the send returns `false` and logs "local mail sink unreachable — it auto-starts with `pnpm run dev` (or run `pnpm dlx @sdk-e/mailbox`)". The form must still succeed.
- In production, an absent `RESEND_API_KEY` is a bug: `sendEnquiryNotification` logs loudly server-side and returns `false` (the user still gets success because the record was stored).

## 6. Verify a send

- **Dev (sink):** start `pnpm dlx @sdk-e/mailbox wait "New project enquiry"` before submitting the form; the command exits with the full message once the email lands. Or call the `maildev` MCP `wait_for_email` tool the same way. For an already-received message use `pnpm dlx @sdk-e/mailbox list` / `pnpm dlx @sdk-e/mailbox read -- <id>`.
- **Production (Resend):** Resend accepts the request and returns an id (`data.id`) even when the message is queued. Confirming "accepted" is not the same as "delivered" — check the Resend dashboard logs for the message, or the webhook if one is configured.
- For the bead's end-to-end verification (`start-a-project.md` §10), confirm the email actually arrives (the sink in dev; the owner's verified inbox in production).

## 7. Related docs

- `docs/content/start-a-project.md` — form spec, pipeline, states, verification
- `docs/conventions/env.md` — `RESEND_API_KEY`, `MAIL_SMTP_URL`
- `docs/content/legal-pages.md` — Resend must be listed as a data processor
