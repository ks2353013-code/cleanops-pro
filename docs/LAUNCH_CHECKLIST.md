# CleanOps AI — Launch and Operations Checklist

This repository is the source of truth. Never mark production ready based only on a successful commit.

## Required production configuration

- `DATABASE_URL`: managed PostgreSQL connection string; use a least-privilege app user and TLS.
- `SESSION_SECRET` (or `AUTH_SECRET`): long, random secret; production auth now fails closed when absent.
- `CLEANOPS_CRON_SECRET`: long random bearer secret used by `GET /api/internal/automation/run`.
- `NEXT_PUBLIC_APP_URL`: canonical HTTPS origin.
- Optional email provider credentials: keep unset until an email adapter has been configured and tested. Current automation worker intentionally runs in dry-run mode and does not send messages.
- Payment provider credentials: configure only after sandbox tests and webhook verification are implemented.

Never commit secrets or put secret values in client-side `NEXT_PUBLIC_*` variables.

## Before a staging release

1. Apply migrations with `npm run db:deploy` using the staging database.
2. Run `npm ci`, `npm test`, and `npm run build` on the exact release commit.
3. Seed only synthetic demo data. Set `CLEANOPS_BOOTSTRAP_TEAM_EMAIL` and `CLEANOPS_BOOTSTRAP_TEAM_PASSWORD` only for a controlled bootstrap, then rotate credentials.
4. Verify sign-in, customer request creation, quote creation, quote acceptance, contract draft creation, operations role restrictions, and cross-organization isolation.
5. Verify the cron endpoint rejects missing/wrong secrets and processes only queued jobs.
6. Test backup restoration, health/readiness endpoints, HTTPS, error logging, rate limits, and session expiry.
7. Test payment provider in sandbox and email in a controlled recipient allowlist before any live action.

## Current automation behavior

The queue uses durable PostgreSQL records, unique event keys, retry scheduling, attempt counts, and a dead-letter state. Service request creation and quote creation enqueue events in the same transaction as the business records. The protected runner records completion in audit logs in **dry-run mode only**. It does not currently send real email, SMS, WhatsApp messages, charge payments, or assign human workers automatically.

## Release blockers to close before calling it fully automated

- Run and fix CI on the latest pull request head.
- Add integration tests with PostgreSQL for request/quote/acceptance/contract state transitions and tenant isolation.
- Connect a real notification adapter with retries, verified sender/domain, suppression and delivery tracking.
- Add payment checkout and verified webhook handling before collecting online payments.
- Add scheduler/cron on the chosen host, set `CLEANOPS_CRON_SECRET` securely, and verify scheduled execution.
- Complete owner-controlled domain, database, storage, privacy/terms, service-provider operations, customer support and refund policies.
- Deploy to staging, run smoke tests, then promote only after owner approval.

## Minimal-cost deployment strategy

Keep the current Next.js + Prisma + PostgreSQL architecture. Use a low-cost managed host and managed PostgreSQL with backups; do not add a paid workflow orchestrator or separate microservices until usage justifies them. Any free-tier provider must be checked for current limits, sleeping behavior, database persistence, backups, and scheduled-job availability before selection.
