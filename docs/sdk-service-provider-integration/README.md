# SDK Enterprises — Service Provider Integration Planning Pack

This pack is the complete implementation context for the SDK Enterprises service-provider / freelancer integration.

## Product model

SDK Enterprises operates a **curated service-provider network**.

- Providers apply and are manually approved.
- Approved providers maintain professional profiles and service catalogues.
- SDK may assign providers directly, invite them to opportunities, or publish opportunities to eligible providers.
- Providers can submit proposals.
- Matching recommends suitable providers but does not make final selection decisions.
- Providers contract commercially with SDK Enterprises.
- Providers invoice SDK Enterprises.
- SDK Enterprises independently invoices clients based on the client agreement.
- Provider compensation, client pricing, and SDK margin are separate financial concepts.
- Opportunity, matching, proposal, engagement, work approval, provider billing, and client billing are separate domains.
- Clients must never see provider compensation or SDK margin.
- Providers must never see client pricing unless explicitly configured.
- Internal SDK notes, compliance data, risk signals, and operational metadata are never externally visible.

## Documents

1. `00-master-context.md`
2. `01-business-model.md`
3. `02-onboarding-vetting-profile.md`
4. `03-opportunities-matching-proposals.md`
5. `04-engagement-work-execution.md`
6. `05-billing-payments.md`
7. `06-reputation-trust-quality.md`
8. `07-provider-portal-ux.md`
9. `08-sdk-admin-operations.md`
10. `09-client-side-integration.md`
11. `10-roles-permissions-security.md`
12. `11-notifications-communications-documents.md`
13. `12-integrations-api-events.md`
14. `13-data-model-state-machines.md`
15. `14-analytics-reporting-observability.md`
16. `15-non-functional-testing-compliance.md`
17. `16-rollout-migration-future.md`
18. `17-requirements-index.md`
19. `18-integration-roadmap.md`
20. `19-agent-implementation-instructions.md`

The files are intentionally written as build context for coding agents rather than as conversational notes.
