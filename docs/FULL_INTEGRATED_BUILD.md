# CleanOps Pro — Full Integrated Build Contract

## Product goal
A B2B commercial cleaning operating system connecting organizations that need cleaning with a qualified cleaning workforce and the internal operations team that delivers the service.

## Customer segments
Schools, hospitals/clinics, offices, hotels, factories, warehouses, retail sites, gyms, residential communities, government/non-profit facilities and other recurring commercial sites.

## Operating flow

1. Lead/request intake
2. Organization and contact verification
3. Facility onboarding
4. Site assessment
5. Service scope and frequency
6. Cost model: labor + consumables + equipment + travel + overhead + target margin + tax
7. Quote
8. Customer approval
9. Contract and SLA
10. Schedule generation
11. Qualified workforce matching
12. Dispatch and confirmation
13. Check-in
14. SOP/checklist execution
15. Evidence and incident capture
16. Supervisor/customer QA
17. Rework/corrective action if needed
18. Job completion
19. Billing/invoice
20. Payment/collections
21. Performance reporting
22. Renewal/upsell

## Workforce model

Worker profiles must support classification, skills, facility eligibility, training/verification status, availability, shift preference, service area, supervisor relationship, performance and incident history. Never expose restricted customer information beyond the worker's assignment scope.

## Facility-specific controls

### Healthcare
Restricted-area access, PPE requirements, infection-control/customer SOP acknowledgement, incident escalation and evidence requirements are configurable. The platform must not claim legal/regulatory certification merely because a worker completed an internal checklist.

### Schools
Child-safety/site-access policies, timing around school activity, classroom/sanitation checklists, incident escalation and restricted-area rules.

### Offices
Recurring janitorial schedules, consumables, washroom checks, meeting/event exception requests and after-hours access.

### Hotels
Room/public-area workflows, turnaround windows, linen/consumable coordination and quality inspections.

### Industrial/warehouse
PPE, zone restrictions, equipment, chemical handling records, shift windows and incident escalation.

## Roles

- Platform administrator: platform-level configuration and support.
- Cleaning company administrator: organization configuration, pricing, workforce and financial visibility.
- Operations manager: requests, assessments, dispatch, schedules, exceptions and QA.
- Supervisor: assigned teams, inspections, rework and incidents.
- Professional: own profile, eligible assignments, check-in/out, SOPs and evidence.
- Client manager: own facilities, requests, quotes, schedules, completion evidence, complaints and invoices.
- Finance: invoices, payments, aging and reconciliation permissions.

## Non-negotiable security

Every tenant-scoped API derives organization scope from the authenticated session or a server-side authorized context. Client-provided organization IDs are never trusted for authorization. Resource ownership is rechecked on mutations. Privileged actions are audited. Sensitive documents use authorization-aware access.

## Financial controls

Use integer minor units or Decimal for money where the ORM/database supports it. Never use floating-point arithmetic for persisted financial amounts. Invoice creation must be idempotent. Payment webhooks must verify signatures, reject replay, and be safe to retry.

## Scheduling controls

Recurring schedules must be deterministic, timezone-aware and idempotent. Concurrent dispatch attempts must not double-assign a job. A no-show must create an operational exception and allow replacement without destroying the original assignment history.

## Completion controls

A job can only reach final completion when required checklist/evidence/inspection conditions for that contract are satisfied or an authorized override is recorded with an audit reason.

## Observability

Every production mutation should be attributable to an actor, organization, timestamp and entity. Operational errors must be actionable without exposing secrets or sensitive customer data. Health checks should distinguish process health from database readiness.

## Launch scope

The first operational release prioritizes the complete service-delivery loop over advanced AI. AI optimization, route optimization, native mobile packaging and deep third-party accounting integrations remain additive once the core workflow is reliable.

## Definition of done

CleanOps is operationally ready only when a staging organization can execute a complete school, healthcare and office workflow from request through billing; an authorized user can see only permitted tenant data; a professional can complete an assignment from a mobile browser; a failed QA event creates rework; a no-show can be replaced without losing history; and CI/E2E checks pass against a production-like database.
