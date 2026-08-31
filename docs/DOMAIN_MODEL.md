# CleanOps Pro — Domain Model

CleanOps is modeled around the real commercial-cleaning lifecycle.

## Core entities

- Organization — tenant/company boundary.
- User — authenticated person with role and organization membership.
- Facility — customer site such as hospital, school, office, hotel, factory, warehouse, retail or gym.
- Service Request — requested work, urgency, scope and facility requirements.
- Site Assessment — measured area, risk, staffing and service assumptions.
- Quote — priced proposal with cost, margin, validity and approval state.
- Contract — commercial agreement, frequency, SLA, dates, included visits and renewal policy.
- Schedule — recurring or one-time service occurrence generation.
- Job / Work Order — executable service instance with controlled lifecycle.
- Professional — cleaning worker/supervisor with classification, availability, training and eligibility.
- Assignment — relationship between a job and workforce member/team.
- SOP / Checklist — facility/service-specific execution requirements.
- Evidence — proof attached to job execution.
- Inspection — quality verification and score.
- Complaint / Corrective Action — customer issue and remediation workflow.
- Inventory / Asset — chemicals, PPE, equipment and site allocations.
- Invoice / Payment — billing, collections and receivables state.
- Notification — operational event delivery.
- Audit Event — immutable security/operational history.

## Non-negotiable invariants

1. Organization ownership must be enforced on every tenant-scoped read and write.
2. Facility, contract, job, invoice and evidence relationships must never cross organizations.
3. Job status changes must use the allowed state machine.
4. Restricted facility work requires an eligible professional.
5. A completed job needs its required execution/quality evidence before final acceptance where the contract requires it.
6. Billing must derive from approved commercial terms and completed billable work, not arbitrary UI totals.
7. Privileged actions require role authorization and should create audit events.
8. Deleting operational history should be avoided; use status/archival semantics where appropriate.
9. External integrations must fail safely and be retryable/idempotent.
10. Financial and compliance records require stronger auditability than ordinary UI preferences.
