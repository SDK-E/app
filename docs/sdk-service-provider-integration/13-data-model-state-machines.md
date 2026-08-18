# Round 13 — Data Model & State Machines

## Modeling principle

Use explicit entities and state machines instead of large user records with many booleans.

## Core entities

### Identity / actors

- User
- Organization
- ClientOrganization
- Provider
- ProviderBusinessProfile
- SDKStaffProfile

### Provider domain

- ProviderApplication
- ProviderProfile
- Skill
- ProviderSkill
- PortfolioItem
- ProviderService
- AvailabilitySchedule
- CapacityAllocation
- Absence
- Verification
- VerificationEvidence
- ProviderTierHistory
- ProviderHealthHistory

### Opportunity domain

- ClientRequest
- Project
- Opportunity
- OpportunityPosition
- OpportunityRequirement
- MatchRun
- MatchCandidate
- Invitation
- SavedOpportunity

### Proposal domain

- Proposal
- ProposalVersion
- ProposalMilestone
- ProposalMessage
- Interview
- InterviewEvaluation
- Offer

### Engagement domain

- Engagement
- EngagementTermsVersion
- StatementOfWork
- Milestone
- Task
- Deliverable
- DeliverableVersion
- TimeEntry
- Timesheet
- DayStatement
- RetainerPeriod
- ChangeRequest
- ChangeRequestVersion

### Finance domain

- ProviderCompensationRule
- ClientPricingRule
- RateCard
- InvoiceableItem
- ProviderInvoice
- ProviderInvoiceLine
- ProviderPayment
- ClientInvoice
- ClientInvoiceLine
- ClientPayment
- Expense
- CreditNote
- PurchaseOrder
- TaxProfile
- ExchangeRateSnapshot
- ReconciliationMatch

### Trust domain

- Review
- ProviderPerformanceSnapshot
- SkillVerification
- RiskSignal
- Warning
- Restriction
- Incident
- Complaint
- Dispute
- Appeal

### Platform domain

- Document
- DocumentVersion
- MessageThread
- Message
- Notification
- NotificationDelivery
- AuditEvent
- SupportCase
- IntegrationConnection
- IntegrationSyncRecord

## Important relationships

- User may own one Provider profile.
- Client organization contains client users.
- Project belongs to a client organization.
- Opportunity belongs to a project/client need.
- Opportunity may contain multiple positions.
- Proposal targets an opportunity/position.
- Accepted offer creates or references an engagement.
- Engagement links provider, SDK, and client/project context.
- Provider financial records link to engagement but remain distinct from client financial records.

## State-machine requirement

State transitions must be explicit commands with validation.

Do not allow arbitrary status assignment from external clients.

## Historical records

Use version/history entities for:

- Commercial terms
- Proposal revisions
- Deliverables
- Provider tiers/health
- Verification
- Financial documents
- Rate changes

## Soft deletion

Business records with legal/audit value should generally be archived rather than hard deleted.

## Derived data

Examples:

- Available capacity
- Match score
- Profile completeness
- Reputation score
- Margin
- Invoiceable amount

Derived data may be cached, but source-of-truth inputs must remain identifiable.

## IDs

Use stable globally unique identifiers suitable for distributed integrations.

## Money

Store monetary values using precise decimal/minor-unit-safe representation and explicit currency.

## Time

Store timestamps consistently and preserve relevant business timezone for schedules/deadlines.
