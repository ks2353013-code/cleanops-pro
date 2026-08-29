# CleanOps Pro — Technical Architecture

## Application layers

```text
Clients (Web / Mobile PWA)
        |
        v
API / Application Services
        |
  +-----+------+------------------+
  |            |                  |
Identity    Operations         Commercial
  |            |                  |
Users/Roles  Requests/Sites    Contracts/Billing
Tenants      Scheduling        Payments/Finance
             Workforce         Notifications
             SOP/Quality
        |
        v
Persistence + Object Storage + Audit Log
        |
        v
AI / Analytics / External Integrations
```

## Recommended production stack

- TypeScript throughout the application layer
- Next.js/React for the web portal
- Node.js API services
- PostgreSQL for transactional business data
- Redis for queues, rate limiting and ephemeral scheduling state
- S3-compatible object storage for documents and media evidence
- Background workers for notifications, recurring schedules and reports
- OpenTelemetry-compatible instrumentation

MongoDB remains viable, but the initial domain is highly relational: organizations own facilities; facilities have contracts; contracts create schedules; schedules create jobs; jobs have teams, checklist runs, evidence, inspections and invoices. PostgreSQL is therefore the default recommendation.

## Domain entities

- User
- Organization
- Membership
- Facility
- Contact
- ServiceCatalogItem
- ServiceRequest
- FacilityAssessment
- Quote
- QuoteLine
- Contract
- ContractSite
- ServicePlan
- ScheduleRule
- Job
- JobAssignment
- ProfessionalProfile
- Skill
- Certification
- Verification
- AttendanceEvent
- SOPTemplate
- SOPRun
- ChecklistItemRun
- EvidenceAsset
- Inspection
- Complaint
- Invoice
- Payment
- Payout
- Notification
- AuditEvent

## Tenancy model

Every tenant-owned record carries `organization_id`. Access is derived from the authenticated membership and checked server-side on every query/mutation. Platform admins have explicit elevated scopes and all high-risk operations create audit events.

## Job state model

`draft -> scheduled -> assigned -> in_progress -> awaiting_inspection -> completed`

Exception states can branch to `blocked`, `cancelled` or `rework_required`.

## Contract state model

`draft -> proposed -> active -> paused -> renewal_due -> expired -> cancelled`

## Security requirements

- Short-lived access tokens with refresh/session rotation
- Passwords hashed with a current password hashing algorithm
- MFA support for privileged users
- Object-level authorization, not only route-level authorization
- Signed/controlled media access
- Virus/type validation for uploaded files
- Request validation at API boundaries
- Audit events for authentication, role changes, verification decisions, contract changes, billing and payment actions
- Secrets only through environment/secret manager

## Operational reliability

- `/health` for process health
- `/ready` for dependency readiness
- Graceful shutdown
- Queue retry with dead-letter handling
- Idempotency keys for external side effects
- Database migrations version-controlled
- Automated backups
- Structured JSON logs

## AI boundary

AI services are advisory. They can propose assessment results, staffing, pricing or quality flags, but transactional services retain deterministic rules and human approval where risk is material.
