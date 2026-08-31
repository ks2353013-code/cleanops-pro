# CleanOps Pro operating model

CleanOps Pro is a B2B commercial cleaning service platform. It is not a consumer marketplace or a generic task tracker.

## Public experience
- `/` is the commercial-cleaning landing and service sales page.
- `/register` creates a customer organization and client manager.
- `/login` is customer login and routes customer users to `/client`.
- `/customer-login` is an explicit customer-login alias.
- `/team-login` is a separate internal team login.

## Internal team
- `/ops` is the protected CleanOps control center.
- Internal roles currently supported by the domain model: Platform Admin, Operations Manager, Supervisor and Professional.
- Professional users are routed to `/professional`.
- Operations users can work across sales, customers, facilities, assessments, quotes, contracts, scheduling, jobs, workforce, quality/rework, invoices, payments and reporting.

## Customer lifecycle
Lead/request -> site assessment -> quote -> contract -> recurring/one-off service -> service delivery -> inspection -> rework/re-inspection when required -> approval -> invoice -> payment -> financial visibility.

## Production security rules
- Never remove server-side role checks to make a page load.
- Customer data must be scoped to the authenticated organization.
- Team data must be scoped to the authenticated organization unless the user is Platform Admin.
- Never use first-organization lookups for authenticated customer actions.
- Do not commit production credentials.

## Team bootstrap
Set these environment variables in staging before deployment when you need the first internal admin:
- `CLEANOPS_BOOTSTRAP_TEAM_EMAIL`
- `CLEANOPS_BOOTSTRAP_TEAM_PASSWORD`

Startup runs the idempotent seed after migrations. If these variables are absent, no team account is created. The demo organization/facility remains idempotent.
