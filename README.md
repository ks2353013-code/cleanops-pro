# CleanOps Pro

B2B commercial cleaning operations platform for schools, hospitals, offices, hotels, factories, warehouses, retail facilities, residential communities and other institutional customers.

## Product model

CleanOps Pro is designed as a managed B2B service platform rather than a simple consumer booking marketplace.

**Customer request → assessment → quotation → contract → scheduling → professional team → checklist → inspection → billing**

## Product surfaces

- Client Portal — organizations, facilities, service requests, quotations, contracts, schedules, complaints and invoices.
- Professional App — onboarding, verification, classification, assignments, check-in/out, SOPs, evidence and earnings.
- Admin Operations Console — workforce, sites, contracts, scheduling, quality, billing and profitability.

## Initial MVP

The repository starts with a responsive browser prototype in `index.html` that demonstrates the operations control center and core workflows.

## Planned production architecture

- Web client: responsive React/Next.js application
- API: Node.js/TypeScript service layer
- Database: PostgreSQL or MongoDB depending on final domain model decision
- Object storage: S3-compatible storage for documents and before/after evidence
- Authentication: secure role-based identity with organization/tenant isolation
- Payments: India-ready payment gateway abstraction
- Notifications: email/SMS/WhatsApp/push abstraction
- Maps/GPS: site geofencing and attendance verification
- Observability: structured logs, audit events, health/readiness checks
- AI layer: facility assessment, quoting assistance, workforce assignment and quality intelligence

## Roles

- Platform Admin
- Operations Manager
- Facility/Account Manager
- Site Supervisor
- Cleaning Professional
- Finance/Billing Manager
- Client Organization Admin
- Client Facility Manager

## Development principles

1. B2B-first and contract-first.
2. Every operational action should be auditable.
3. Facility-specific SOPs and service-level agreements are first-class entities.
4. Worker verification and professional classification are core trust infrastructure.
5. Tenant and role isolation must be enforced server-side.
6. Do not hardcode secrets or production credentials.
7. Build mobile-friendly workflows for professionals from the start.

## Live application surfaces

- Public commercial-cleaning landing: `/`
- Customer login: `/login` (also `/customer-login`)
- Customer portal: `/client`
- CleanOps team login: `/team-login`
- CleanOps internal control center: `/ops`
- Professional mobile-oriented work area: `/professional`

For staging, set `CLEANOPS_BOOTSTRAP_TEAM_EMAIL` and `CLEANOPS_BOOTSTRAP_TEAM_PASSWORD` in the hosting environment to provision the first internal Platform Admin. Never use shared/default credentials in production.
