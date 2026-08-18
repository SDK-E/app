# Step-by-Step Integration Roadmap

This is the recommended implementation order for coding agents.

Each step should be treated as a bounded implementation unit with its own tests and documentation.

---

## Step 1 — Domain foundations

### Build

- Actor and organization model
- Provider entity
- Role/capability authorization framework
- Audit event model
- Domain status/state-machine convention
- Money/currency primitive
- Timezone/schedule primitive

### Dependencies

None.

### Acceptance criteria

- Provider exists independently from generic User.
- Provider/client/SDK role boundaries can be tested.
- Important mutations can generate audit records.
- Money is currency-aware.
- Status transitions cannot be arbitrarily assigned.

---

## Step 2 — Provider application

### Build

- Provider application entity
- Draft/save
- Submit
- Application fields
- Completeness validation
- Admin review queue
- Changes requested
- Approve/reject

### Dependencies

Step 1.

### Acceptance criteria

- Incomplete applications cannot be submitted.
- Provider cannot approve own application.
- Every review transition is audited.
- Rejected/changes-requested reasons are stored separately from internal notes.

---

## Step 3 — Provider profile and skills

### Build

- Provider profile
- Skills taxonomy
- Provider skills/proficiency
- Portfolio
- Languages
- Experience
- Visibility settings

### Dependencies

Steps 1–2.

### Acceptance criteria

- Client-visible serialization excludes internal/provider-private data.
- SDK can manage skill catalogue.
- Provider can suggest skills without directly modifying controlled taxonomy.

---

## Step 4 — Verification and commercial readiness

### Build

- Verification records
- Identity/business/tax verification
- Evidence documents
- Contract readiness
- Payout readiness
- Commercial activation checks

### Dependencies

Steps 1–3 + document infrastructure.

### Acceptance criteria

- Verification requirements are configurable.
- Approval and commercial readiness are distinct.
- Sensitive data is permission-controlled.

---

## Step 5 — Availability and capacity

### Build

- Weekly capacity
- Availability periods
- Absences
- Future reservations
- Capacity calculation

### Dependencies

Provider profile.

### Acceptance criteria

- Available capacity is derived correctly.
- Future engagements can reserve capacity.
- Absence reduces capacity.
- Timezone is preserved.

---

## Step 6 — Provider services

### Build

- Service draft
- Service pricing metadata
- Media/assets
- Submit for approval
- SDK moderation
- Publish/unpublish

### Dependencies

Provider profile, documents.

### Acceptance criteria

- Provider cannot self-publish unapproved services.
- Published service snapshot is client-safe.

---

## Step 7 — Client requests and projects

### Build

- Structured client request
- SDK review/conversion
- Project/client need
- Internal ownership

### Dependencies

Existing client domain + Step 1.

### Acceptance criteria

- Client request does not automatically become provider-visible.
- SDK can convert request into an opportunity.

---

## Step 8 — Opportunities

### Build

- Opportunity
- Positions
- Requirements
- Visibility modes
- Lifecycle
- Attachments
- Internal notes

### Dependencies

Steps 3, 5, 7.

### Acceptance criteria

- Direct, invite-only, and eligible-network modes work.
- Internal notes are not externally exposed.
- Multi-role opportunities are supported.

---

## Step 9 — Matching V1

### Build

- Hard eligibility filters
- Weighted score
- Match run
- Candidate records
- Explanation
- Warnings
- Boost/suppress/exclude
- Configurable weights

### Dependencies

Steps 3, 5, 8.

### Acceptance criteria

- Same input/config produces explainable results.
- Operators can see why providers matched.
- Manual overrides are audited.
- Matching does not change selection state.

---

## Step 10 — Invitations and opportunity browsing

### Build

- Invitations
- Accept/decline/expire
- Eligible opportunity browsing
- Save/hide
- Notifications

### Dependencies

Steps 8–9.

### Acceptance criteria

- Only eligible/authorized providers see opportunities.
- Invitation expiry is deterministic.
- Notifications are idempotent.

---

## Step 11 — Proposals

### Build

- Proposal draft
- Proposal versions
- Pricing
- Availability
- Milestones
- Attachments
- Questions/answers
- Revision requests
- Thread
- Withdrawal/expiry

### Dependencies

Step 10.

### Acceptance criteria

- Submitted proposal version is preserved.
- Revision creates new version.
- Provider/client pricing boundaries remain intact.

---

## Step 12 — Shortlisting, interviews and offers

### Build

- Shortlist
- Interview
- Evaluation
- Client approval path
- Offer
- Provider acceptance

### Dependencies

Step 11.

### Acceptance criteria

- Workflow can be SDK-only or include client approval.
- Offer acceptance captures final terms.
- Rejected candidates remain historically queryable.

---

## Step 13 — Engagement core

### Build

- Engagement
- Parties
- Engagement type
- Terms version
- Lifecycle
- SOW
- Contract references

### Dependencies

Step 12.

### Acceptance criteria

- Accepted offer can create engagement.
- Provider compensation and client pricing are separate.
- Terms are versioned.

---

## Step 14 — Milestones and deliverables

### Build

- Milestones
- Acceptance criteria
- Deliverables
- Deliverable versions
- Review/revision

### Dependencies

Step 13.

### Acceptance criteria

- Historical deliverables cannot be overwritten.
- Approval is auditable.
- Client review can be optional/configurable.

---

## Step 15 — Time, timesheets, day rates and retainers

### Build

- Time entries
- Timesheets
- Day statements
- Retainer periods/utilization
- Approval flows

### Dependencies

Step 13.

### Acceptance criteria

- Different engagement models use correct work-recognition mechanism.
- Approved work can become invoiceable.
- Day rates are not represented as fake hourly entries.

---

## Step 16 — Change requests and completion

### Build

- Change request
- Impact assessment
- Approval
- Terms application
- Completion validation
- Closure
- Termination

### Dependencies

Steps 13–15.

### Acceptance criteria

- Agreed terms never mutate silently.
- Completion can enforce outstanding requirements.
- Termination handles unresolved work/finance states.

---

## Step 17 — Provider financial foundations

### Build

- Provider compensation rules
- Invoiceable items
- Provider tax profile
- Payout account model
- Provider invoice
- Provider invoice lines

### Dependencies

Steps 13–16.

### Acceptance criteria

- Invoiceable items cannot be double-invoiced.
- Provider invoice does not depend on client invoice.
- Currency is explicit.

---

## Step 18 — Provider invoice approval and payments

### Build

- Provider invoice workflow
- Review/changes/approval
- Payment scheduling
- Partial payments
- Payment evidence
- Reconciliation state

### Dependencies

Step 17.

### Acceptance criteria

- Issued/submitted historical documents are preserved appropriately.
- Payment status is not inferred solely from invoice status.
- Payout changes are strongly audited.

---

## Step 19 — Client pricing and invoices

### Build

- Client pricing rules
- Billing schedule
- Client invoice
- Client invoice lines
- PO support
- Tax handling
- Credit notes

### Dependencies

Engagement + finance primitives.

### Acceptance criteria

- Client pricing never leaks provider cost.
- Issued invoices are immutable.
- Provider invoice timing does not control client invoice timing.

---

## Step 20 — Client payments and reconciliation

### Build

- Client payment
- Partial payment
- Invoice matching
- Aging
- Reconciliation

### Dependencies

Step 19.

### Acceptance criteria

- Support partial/multi-invoice reconciliation.
- Receivable states are correct.

---

## Step 21 — Provider reputation and reviews

### Build

- Client review
- Internal evaluation
- Performance snapshots
- Provider tier
- Provider health

### Dependencies

Completed/active engagements.

### Acceptance criteria

- Internal and external ratings remain distinct.
- Historical reputation values are preserved.

---

## Step 22 — Verification lifecycle and trust operations

### Build

- Expiry/revocation
- Risk signals
- Warnings
- Restrictions
- Suspension
- Offboarding
- Appeals

### Dependencies

Provider domain + audit + reputation.

### Acceptance criteria

- Risk signals do not automatically punish provider unless explicitly configured.
- Suspension preserves legally required access/history.

---

## Step 23 — Incidents, complaints and disputes

### Build

Three separate domains with references between them.

### Dependencies

Engagement/work/finance.

### Acceptance criteria

- Complaint, incident, and dispute remain semantically separate.
- Evidence and audit history are preserved.

---

## Step 24 — Provider portal foundation

### Build

- Navigation
- Dashboard
- Action center
- Notifications
- Common loading/error/empty states

### Dependencies

Underlying provider APIs.

### Acceptance criteria

- Provider immediately sees outstanding actions.
- Portal works responsively.

---

## Step 25 — Provider operational pages

### Build

- Opportunities
- Proposals
- Engagements
- Work queue
- Calendar
- Capacity
- Services
- Profile
- Documents
- Earnings
- Invoices
- Settings/support

### Dependencies

Steps 3–23 as applicable.

### Acceptance criteria

- All data is provider-safe.
- Cross-engagement work queue is actionable.

---

## Step 26 — SDK operations portal

### Build

- Queues
- Provider 360
- Client 360
- Project 360
- Opportunity ops
- Engagement ops
- Finance ops
- Trust ops
- Audit explorer
- Configuration

### Dependencies

Core domains.

### Acceptance criteria

- Operations are queue/exception-driven.
- Sensitive actions honor capability permissions.
- Overrides are audited.

---

## Step 27 — Client portal integration

### Build

- Request intake
- Provider shortlist
- Interviews
- Engagement approvals
- Client documents
- Client billing
- Reviews

### Dependencies

Existing client portal + provider domains.

### Acceptance criteria

- No provider cost/internal SDK leakage.
- Client involvement is configurable per engagement/opportunity.

---

## Step 28 — Notifications and communication hardening

### Build

- Central notification routing
- Preferences
- Delivery retries
- Contextual threads
- Templates
- Delivery monitoring

### Dependencies

Domain events.

### Acceptance criteria

- Duplicate event processing does not duplicate notifications.
- Internal/external message visibility is enforced.

---

## Step 29 — External integrations

### Suggested order

1. Calendar
2. E-signature
3. Email
4. Accounting
5. Banking/reconciliation
6. Verification providers
7. Optional PM/time tools

### Acceptance criteria

- Core domain works without any single external vendor.
- Sync failures are visible and retryable.

---

## Step 30 — Analytics and observability

### Build

- Provider/network metrics
- Opportunity funnel
- Engagement health
- Finance metrics
- Trust metrics
- Failure dashboards
- Backlog/stuck-state monitoring

### Dependencies

Stable domain events/data.

---

## Step 31 — Security and compliance hardening

### Build

- Permission test suite
- MFA/reauth for privileged actions
- Sensitive access logging
- Data export/deletion workflows
- Retention policies
- Rate limits
- File security

### Dependencies

All major domains.

---

## Step 32 — Pilot rollout

### Build

- Feature flags
- Pilot cohort
- Operational runbooks
- Support process
- Migration/backfill where needed

### Acceptance criteria

- Small provider/client cohort can complete full lifecycle end-to-end.
- Financial and permission boundaries are verified in production-like conditions.

---

## Step 33 — Matching V2 / advanced automation

Only after enough real data exists.

Possible additions:

- Semantic matching
- Historical success prediction
- Capacity optimization
- AI-assisted opportunity drafting
- AI-assisted provider/profile enrichment
- Automated recommendation explanations

AI recommendations remain explainable and operator-overridable.
