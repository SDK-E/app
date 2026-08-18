# Round 14 — Analytics, Reporting & Observability

## Provider analytics

Provider-visible:

- Completed engagements
- Active engagements
- On-time delivery rate
- Client rating
- Verified skills
- Response rate
- Repeat clients
- Capacity/utilization
- Earnings
- Invoice/payment history
- Profile completeness

## SDK network analytics

Track:

- Applications
- Approval rate
- Time to approval
- Active providers
- Available capacity
- Skill coverage
- Verification coverage
- Provider utilization
- Inactivity
- Suspension/offboarding trends

## Opportunity analytics

Track:

- Opportunities created
- Time to publish
- Match pool size
- Invitation acceptance
- Proposal rate
- Time to shortlist
- Time to fill
- Fill rate
- Cancellation rate
- Skill shortages

## Engagement analytics

Track:

- Active engagements
- Delivery health
- Late milestones
- Revision rate
- Timesheet approval time
- Change request volume
- Completion rate
- Termination rate
- Disputes

## Financial analytics

Track:

- Provider cost
- Client revenue
- Gross margin
- Margin %
- Provider liabilities
- Client receivables
- Invoice aging
- Payment delays
- Revenue/cost forecast
- Expenses
- FX impact when relevant

## Trust analytics

Track:

- Ratings
- Internal quality
- Risk signals
- Complaints
- Incidents
- Disputes
- Warning/suspension frequency
- Verification expirations

## Reporting

Support:

- Date filtering
- Client
- Provider
- Project
- Engagement
- Skill/category
- Geography/timezone
- Currency
- Status
- Team/owner

## Export

Permission-aware CSV/XLSX or downstream BI exports may be added.

## Operational observability

Monitor:

- API errors
- Queue failures
- Event processing failures
- Notification failures
- Document generation failures
- Webhook failures
- Integration sync failures
- Reconciliation failures
- Workflow states stuck beyond thresholds

## Correlation

Use request/job/event correlation IDs where practical.

## Alerting

Create alerts for business-critical failure conditions and abnormal workflow backlogs.

## Audit vs telemetry

Audit logs are immutable business/security records.

Telemetry/logging is operational diagnostic data.

Do not treat them as interchangeable.
