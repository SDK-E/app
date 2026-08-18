# Round 5 — Billing, Invoicing & Payments

## Financial architecture

Provider side:

`Provider → Provider Invoice → SDK Approval → Provider Payment`

Client side:

`SDK Enterprises → Client Invoice → Client Payment`

The flows are independent.

## Provider compensation

Support:

- Hourly
- Day rate
- Fixed amount
- Milestone
- Retainer
- Custom schedule

Snapshot rates into engagements.

## Client pricing

Support the same broad pricing models, independently from provider compensation.

## Margin

Internally track:

- Revenue
- Provider cost
- Attributable expenses
- Gross margin
- Margin percentage
- Target margin
- Forecast margin

Never expose margin externally.

## Rate cards

Support:

- Provider defaults
- Client-specific
- Service
- Skill/seniority
- Project-specific
- Negotiated overrides

All rate changes are versioned.

## Currency

Multi-currency from the beginning.

Store currency for every monetary amount and support:

- Provider currency
- Engagement currency
- Client billing currency
- SDK base/reporting currency
- Exchange rate
- Rate date/source
- FX gain/loss when relevant

## Invoiceable work

Examples:

- Approved timesheet
- Approved milestone
- Retainer period
- Approved day statement

Track:

`Pending → Approved → Invoiceable → Invoiced → Paid`

## Provider invoices

Providers may:

- Build from invoiceable items
- Upload an external invoice
- Generate an invoice through the portal
- Preview
- Submit
- Download
- Track status

Prevent duplicate billing.

## Provider invoice states

`Draft → Submitted → Under Review → Approved → Scheduled for Payment → Paid → Reconciled`

Alternative:

`Changes Requested / Rejected / Cancelled / Partially Paid / Overdue`

## Provider invoice requirements

Include legal identity, invoice number/date, service period, engagement, line items, tax/VAT, total, currency, terms, payout details, supporting documents.

## Payout details

Store separately and securely.

Changes require strong verification, audit history, and optional manual review.

## Provider payments

Support:

- Scheduling
- Manual recording
- Partial payment
- Payment evidence
- Bank reference
- Reconciliation

## Client billing

Client invoices may originate from:

- Time
- Milestones
- Fixed schedules
- Retainers
- Day rates
- Expenses
- Manual charges
- Credits

## Client invoice states

`Draft → Internal Review → Approved → Issued → Sent → Partially Paid → Paid → Reconciled`

Alternative:

`Overdue / Disputed / Void / Written Off`

## Issued invoices

Issued invoice snapshots are immutable.

Corrections use credit notes or corrective documents.

## Tax

Model tax as a dedicated configurable domain.

Support:

- VAT
- Exemptions
- Reverse charge
- Tax IDs
- Jurisdiction
- Tax metadata
- Provider/client tax profiles

Business/legal configuration remains controlled by SDK/accounting.

## Expenses

Provider expense states:

`Draft → Submitted → SDK Review → Optional Client Review → Approved → Reimbursable → Invoiced → Paid`

Track provider-reimbursable and client-billable independently.

## Payment terms

Support common Net terms and custom dates.

Provider and client terms are independent.

## Purchase orders

Support client PO number, document, maximum value, validity, and remaining balance.

## Financial approvals

Configurable approval policies based on amount, role, risk, margin, or other conditions.

## Financial security boundaries

- Provider compensation: never client-visible
- Client pricing: never provider-visible by default
- SDK margin: never external
- Internal finance notes: never external

## Accounting integration

Use an abstraction layer suitable for systems such as Pennylane, Xero, QuickBooks, or Sage.

## Banking/payment integration

Use provider-neutral payment and transaction abstractions.

## Reconciliation

Support:

- One payment to one invoice
- One payment to multiple invoices
- Multiple payments to one invoice
- Partial matching
- Manual matching
- Automatic suggestions
- Unmatched transactions

## Financial dashboards

Provider:
earnings, invoiceable, invoiced, awaiting payment, paid.

SDK:
revenue, receivables, provider liabilities, costs, margin, cash/payment states.

Client:
invoices, payments, spend, PO consumption.

## Financial invariants

- Issued invoice != editable draft
- Approved work != paid work
- Provider invoice != client invoice
- Provider compensation != client price
- Revenue != cash collected
- Provider cost != cash paid
- Invoiceable != invoiced
- Invoiced != paid
