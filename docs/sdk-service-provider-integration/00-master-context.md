# Master Context — SDK Enterprises Service Provider Integration

## Objective

Add a complete service-provider operating system to SDK Enterprises without turning the application into an uncontrolled open marketplace.

The product must support the full lifecycle:

`Provider Application → Vetting → Approval → Profile/Services → Opportunities → Matching → Invitations → Proposals → Selection → Engagement → Work → Approval → Provider Invoice → Provider Payment`

The client-facing commercial lifecycle is separate:

`Client Need → Client Agreement → Opportunity/Project → Client Billing → Client Invoice → Client Payment`

Both lifecycles may reference the same project or engagement, but financial and permission boundaries must remain independent.

## Primary actors

- Provider
- Client user
- SDK Provider Operations
- SDK Project / Delivery Manager
- SDK Finance
- SDK Compliance
- SDK Support
- SDK Administrator
- System / automation

## Core domain boundaries

### Provider

Identity, professional profile, skills, portfolio, services, availability, capacity, business details, tax configuration, verification, reputation, health.

### Opportunity

A provider-facing work opportunity derived from an SDK-created need, client request, or another internal workflow.

### Matching

Eligibility filtering and ranked recommendation. Matching does not mean selection.

### Proposal

A provider's commercial/work response to an opportunity. Versioned and negotiable.

### Engagement

The accepted provider-side work agreement linking provider, SDK, client/project context, scope, dates, compensation, and work rules.

### Work

Milestones, tasks, deliverables, time entries, timesheets, day statements, retainer utilization, approvals, change requests.

### Provider Financials

Provider compensation, invoice eligibility, provider invoices, SDK approval, provider payments, reconciliation.

### Client Financials

Client pricing, client invoices, client payments, client-specific billing rules.

### Trust

Reviews, skill verification, quality metrics, risk signals, incidents, complaints, disputes, warnings, restrictions, suspension, offboarding.

## Non-negotiable invariants

1. `Provider compensation != Client price`
2. `Provider invoice != Client invoice`
3. `Matching != Selection`
4. `Proposal != Engagement`
5. `Approved work != Paid work`
6. `Invoiceable != Invoiced`
7. `Invoiced != Paid`
8. `Internal reputation != Public rating`
9. `Complaint != Proven misconduct`
10. `Suspended != Deleted`
11. Issued financial documents are immutable.
12. Agreed commercial terms are versioned; historical terms are never silently overwritten.
13. Client-facing permissions must not expose provider costs, internal notes, risk signals, or SDK margin.
14. Provider-facing permissions must not expose client pricing, margin, or internal SDK notes.
15. Administrative overrides require permission, reason, actor, timestamp, and audit history.

## Recommended delivery principle

Build the platform as a modular set of capabilities rather than a single “freelancer portal” feature.

The implementation roadmap in `18-integration-roadmap.md` is the source of truth for sequencing.
