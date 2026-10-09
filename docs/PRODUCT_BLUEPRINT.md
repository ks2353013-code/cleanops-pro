# CleanOps — Product Blueprint

## Product promise
CleanOps is a managed cleaning-services business in a customer-friendly app. Customers select a clearly described service, understand the exact scope and price, choose a time and location, and book/pay. CleanOps then coordinates verified professionals, scheduling, supplies, service checklists, quality assurance, issue resolution, receipts and repeat bookings.

This is a service operator with software powering fulfillment—not an open directory where customers must coordinate workers themselves.

## Two customer journeys

### Personal
Designed for homes and individual customers.
1. Choose a service: regular home cleaning, deep cleaning, kitchen/bathroom, move-in/move-out, sofa/carpet, glass/window or other supported add-on.
2. Enter home size/rooms and any relevant conditions.
3. See inclusions, exclusions, estimated duration, recommended professional count, available slot and final INR price.
4. Enter/select address; choose date/time; add instructions and add-ons.
5. Sign in with verified mobile/email, accept service terms, pay through the configured payment gateway or choose an explicitly supported pay-later method.
6. Receive booking confirmation, assigned professional/arrival updates and a booking reference.
7. Track status, contact support, approve completion, rate the service, raise an issue and rebook.

### Commercial
For offices, hospitals, schools, hotels, factories, warehouses, retail, residential communities and multi-site organizations.
1. Register the organization and add one or more facilities.
2. Choose the service category and site type; provide area, occupancy, operating hours, frequency, risk/compliance requirements and desired start date.
3. Schedule an assessment if required. CleanOps creates a scoped proposal with staffing, visit frequency, deliverables, exclusions, SLA, price and assumptions.
4. Authorized customer accepts the quote; operations generates a contract for review/signature and records its status.
5. Configure recurring schedules, site-specific SOPs, access instructions and escalation contacts.
6. Operations assigns a suitable verified team and supervisor; the customer sees schedules and service progress.
7. Professionals follow digital checklists, check in/out and capture required evidence without exposing sensitive evidence to unauthorized users.
8. Supervisor performs quality checks; failed checks create corrective work and re-inspection.
9. Customer reviews service records, complaints, SLA reports, invoices and payment status; renewals and schedule changes are managed in the portal.

## Interfaces
- Public storefront: service catalogue, Personal/Commercial split, clear pricing or quote explanation, trust signals, service areas, FAQs and booking CTA.
- Customer app: service selection, quote/booking, facilities/addresses, schedule, status, service history, invoices, support and repeat booking.
- Professional mobile workspace: today's assignments, navigation/site instructions, check-in/out, assigned SOP/checklist, evidence, incident reporting and completion.
- Operations console: incoming leads, assessment, quoting, contract status, capacity planning, workforce eligibility, dispatch, attendance, quality/rework, complaints, billing and reporting.
- Platform administration: organization/role management, service catalogue, coverage, pricing rules, automation configuration, audit trail and integration health.

## Automation lifecycle
Request/lead → scope validation → assessment (when required) → quote → customer acceptance → contract → payment/credit authorization → schedule → eligible-team assignment → reminders → check-in/out → service checklist/evidence → QA → rework if needed → completion confirmation → invoice/receipt → feedback → recurrence/renewal.

Each transition must be persisted, tenant-scoped, authorized, idempotent where retried, timestamped and auditable. Failed jobs use bounded retries and a visible dead-letter/recovery process. External actions must be disabled until the provider is configured and verified.

## Pricing principles
- Show personal customers the total payable amount before confirmation; disclose any taxes, add-ons and cancellation rules.
- Commercial prices are quote-driven when site scope, compliance, service frequency or staffing needs assessment.
- Show the assumptions behind a quote: service area, visit frequency, workforce, hours, inclusions, exclusions, tax and validity period.
- Never show a simulated payment as paid. Payment state must come from a verified provider callback/webhook or verified reconciliation.
- Never promise a booking slot until service capacity has been checked.

## Trust, safety and security
- Enforce authentication, server-side role authorization and organization/facility ownership on every private API.
- Store only necessary personal data; restrict access to addresses, phone numbers, contracts, invoices and before/after evidence.
- Verify professionals and required credentials before assigning regulated/high-risk facilities.
- Support incident escalation, customer complaints, refunds/cancellations and an auditable service recovery process.
- Keep payment secrets server-side; verify signatures, amounts, currency, order IDs and replay/idempotency on webhooks.
- Use real monitoring, backups, database migrations, error reporting and tested restore procedures.

## Production launch gates
1. CI tests and production build pass.
2. Staging end-to-end tests pass for personal booking and commercial quote-to-contract.
3. Tenant-isolation and role-negative tests pass.
4. Payment provider sandbox, verified webhooks, refund and reconciliation tests pass before real payments.
5. Notification provider delivery and failure/retry behavior are tested.
6. Cron/worker is scheduled, monitored and protected by a strong secret; dry-run is clearly labelled until external adapters are enabled.
7. Production database, secrets, domain/TLS, backups, privacy/terms/refund policy, service area, prices, staffing and support escalation are configured by the operator.
8. Run a limited pilot and reconcile every booking, payment, completed job and invoice before broad launch.

## Current implementation boundary
The repository contains customer and internal interfaces, persistent request/quote/contract workflows and a durable automation queue foundation. The automation worker currently records dry-run outcomes; this does not send real messages, collect payments or itself guarantee worker availability. Production readiness must be proven by CI, staging, configured integrations and operational launch gates above.
