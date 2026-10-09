# CleanOps AI — Implementation Roadmap

**Goal:** Turn the existing CleanOps Pro repository into a usable, low-cost, B2B-first cleaning-services operating platform with customer-facing portals and a dependable automation backend. Preserve existing routes, product surfaces, workflows, and visual work; extend them instead of replacing them.

## Current baseline

Repository: `ks2353013-code/cleanops-pro`  
Baseline branch: `main`  
Working branch: `feature/cleanops-ai-build-roadmap`

The existing product is intentionally contract-first, not merely a consumer booking marketplace. Its workflow is:

`Customer request → assessment → quotation → contract → scheduling → professional team → checklist/SOP → evidence → inspection → invoice/payment`

Existing surfaces to preserve:
- Public commercial-cleaning landing page
- Customer login and client portal
- Internal operations control center
- Professional mobile-oriented work area

The repository already includes Next.js, React, Prisma, PostgreSQL driver, tests/smoke scripts, Docker files, deployment notes, and a product brief. This plan keeps that stack rather than introducing a paid automation platform or migrating databases without evidence.

## Product scope and release sequence

### Phase 0 — Baseline safety and audit
- Read the existing routes, schema, API handlers, authentication, tenant middleware, and tests before modifying them.
- Run the existing test, smoke, and production build commands in a local/CI environment.
- Record failures as baseline findings; never claim a test passed unless it was actually run.
- Protect secrets and production data. Do not commit `.env`, credentials, uploads, or generated build output.

### Phase 1 — Core customer request-to-quote workflow (first functional milestone)
- Customer can submit a service request for an organization and facility/site.
- Capture service category, address/site, frequency, scope, preferred start date, operating constraints, and contact details.
- Validate input on the server; persist request and audit event.
- Show request status and reference ID to the customer.
- Operations staff can review, request clarification, record an assessment, prepare a quote, and move it through explicit statuses.
- Customer can review/accept or decline a quote; acceptance creates a contract draft pending required confirmation.
- Enforce organization/tenant and role checks server-side on every read and mutation.
- Add tests for valid requests, validation failures, unauthorized access, cross-tenant access, duplicate submission/idempotency, and status transitions.

### Phase 2 — Contract and service delivery
- Contract/SLA records, service schedules, site assignments, workforce availability, and supervisor assignment.
- Professional mobile workflows: assignment acknowledgement, check-in/out, site SOP checklist, exception reporting, and completion evidence.
- Supervisor inspection with pass/fail, corrective action, and re-inspection.
- Preserve audit history for all important changes.

### Phase 3 — Billing and communications
- Invoice creation from approved contract/schedule/service completion.
- Payment-provider abstraction; use sandbox mode first and never store card data.
- Email notification adapter with a no-credentials dry-run mode.
- Add SMS/WhatsApp only when a compliant provider and budget are approved; avoid paid dependencies for the first milestone.

### Phase 4 — Automation engine
Use a small internal, inspectable workflow engine before adopting a third-party automation service:
1. Event is recorded transactionally with the business change.
2. A queued job has a stable ID, tenant ID, event type, payload version, attempts, next-run time, and status.
3. Workers execute allowlisted actions with timeouts, retry/backoff, and idempotency keys.
4. Failures enter a dead-letter state visible to operations; sensitive external actions require approval.
5. Each run records actor/source, inputs/outputs with secrets redacted, timestamps, result, and correlation ID.
6. Scheduled jobs must be safe to run more than once and must not bypass authorization.

Initial automations:
- Request received → customer acknowledgement and operations task.
- Quote ready → notify customer.
- Quote accepted → create contract draft and schedule onboarding task.
- Shift approaching → notify assigned professional/supervisor.
- Job submitted → queue inspection.
- Inspection passed → prepare invoice draft.
- Invoice overdue → create follow-up task; do not send repeated customer messages without deduplication.

### Phase 5 — AI assistance (optional, cost-controlled)
- Start with deterministic rules and templates.
- Add AI behind a provider interface, with feature flags, usage limits, timeouts, and a deterministic fallback.
- AI may draft scope summaries, quote explanations, SOP suggestions, and operational summaries.
- AI must not independently approve contracts, charge payments, make employment decisions, or send unapproved bulk outreach.
- Do not require an LLM for core booking, scheduling, access control, or billing correctness.

### Phase 6 — Launch readiness
- Tenant isolation and role matrix tests.
- Authentication/session security, rate limiting, request validation, secure headers, CSRF protections where applicable, and audit logs.
- Database migrations/backups and documented restore test.
- Health/readiness endpoints, structured logs, error reporting, and alerting.
- CI: install, lint/typecheck if configured, tests, smoke tests, production build.
- Staging deployment with test accounts and synthetic data; production launch only after owner-managed domain, provider credentials, privacy terms, operational staffing, and payment settings are verified.

## Target architecture

- **Web:** existing Next.js/React application and existing route structure.
- **API/domain:** existing server-side Next.js handlers or established service layer; avoid a second backend unless the current code proves it necessary.
- **Database:** PostgreSQL through existing Prisma setup.
- **Identity/authorization:** existing auth implementation after security audit; every record scoped by organization/tenant and checked on the server.
- **Automation:** database-backed jobs/outbox, a small worker/cron entry point, retries, idempotency, audit trail.
- **Files/evidence:** storage adapter; local development adapter first, then low-cost S3-compatible storage only when needed.
- **Payments and messaging:** provider interfaces with sandbox/dry-run defaults.
- **Deployment:** retain existing Docker/Compose and CI setup; choose a low-cost host after measuring the app and checking current free-tier constraints.

## Data and workflow invariants

- Every customer-owned record belongs to an organization/tenant.
- A user can only access records permitted by both tenant membership and role.
- Workflow state changes are validated against an explicit transition map.
- Money is stored as integer minor units plus currency, never floating-point amounts.
- Quotes and invoices retain immutable snapshots of priced line items and applicable terms.
- External actions are idempotent, auditable, retryable, and approval-gated when consequential.
- No secrets in source control or logs.
- Do not silently delete or replace existing features while implementing a phase.

## First milestone acceptance criteria

1. Customer request can be submitted, persisted, and retrieved by its authorized tenant.
2. Invalid payloads receive clear 4xx responses and do not create partial records.
3. Cross-tenant reads and writes are denied by automated tests.
4. Operations can progress a request through assessment and quote states using valid transitions only.
5. Customer sees a clear status/reference and can accept or decline only their own quote.
6. Workflow event/job is deduplicated and can be retried safely.
7. Email/payment integrations remain dry-run or sandbox until configured.
8. Existing pages and tests remain intact; build/test results are documented honestly.

## Working approach

Work in small, reviewable commits on `feature/cleanops-ai-build-roadmap`. Before changing a module, inspect its current implementation and extend it in place. After each milestone, run the relevant tests and production build, summarize changed files and known gaps, and do not deploy or perform real payments/messages without explicit configuration and approval.

## Immediate next action

Audit the current route tree, Prisma schema/migrations, auth and tenant boundaries, tests, and CI workflows. Then implement Phase 1 against the actual existing domain model, without inventing duplicate models or bypassing current access controls.
