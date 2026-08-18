# Round 12 — Integrations, APIs & Domain Events

## Integration principle

Core business logic must not depend directly on a single third-party vendor.

Use adapters/integration boundaries.

## Planned integration categories

- Email
- Calendar
- E-signature
- File/object storage
- Malware scanning
- Accounting
- Banking/payment/reconciliation
- Tax/VAT services where appropriate
- Identity/business verification
- Calendar/video meeting
- Project-management tools
- Time tracking
- CRM/client systems
- Webhooks
- Analytics/data warehouse

## API design

Expose clear resource-oriented APIs around domain boundaries.

Recommended modules:

- Providers
- Provider applications
- Skills
- Services
- Availability
- Opportunities
- Matching
- Invitations
- Proposals
- Interviews
- Engagements
- Milestones
- Deliverables
- Timesheets
- Change requests
- Provider invoices
- Provider payments
- Client invoices
- Client payments
- Reviews
- Verification
- Incidents
- Complaints
- Disputes
- Documents
- Notifications
- Audit

## Commands vs queries

For important workflows, prefer explicit domain commands rather than generic patching.

Examples:

- `submitApplication`
- `approveProvider`
- `publishOpportunity`
- `runMatching`
- `inviteProvider`
- `submitProposal`
- `requestProposalRevision`
- `acceptOffer`
- `activateEngagement`
- `submitDeliverable`
- `approveTimesheet`
- `submitProviderInvoice`
- `issueClientInvoice`
- `suspendProvider`

## Domain events

Emit events for meaningful state changes.

Examples:

- `provider.application.submitted`
- `provider.approved`
- `provider.verification.expiring`
- `service.submitted`
- `service.approved`
- `opportunity.published`
- `matching.completed`
- `provider.invited`
- `proposal.submitted`
- `proposal.revision_requested`
- `provider.offer_accepted`
- `engagement.activated`
- `deliverable.submitted`
- `timesheet.approved`
- `provider_invoice.submitted`
- `provider_invoice.paid`
- `client_invoice.issued`
- `client_payment.recorded`
- `provider.suspended`

## Event requirements

Events should include:

- Stable event ID
- Event type
- Occurred-at timestamp
- Actor when relevant
- Aggregate/entity reference
- Tenant/org context
- Correlation/causation IDs where useful
- Version/schema

## Idempotency

Commands that may be retried must support idempotency.

External webhooks must be idempotently processed.

## Integration status

Track sync state, last success, last failure, retry count, and external IDs.

## Outbox/reliable delivery

For business-critical events, use a reliable event/outbox pattern appropriate to the existing stack.

## Webhooks

Provide signed outgoing webhooks later if external client/provider systems need integration.
