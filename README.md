# CleanOps Pro

CleanOps Pro is a multi-tenant commercial-cleaning operations platform for institutional facilities: hospitals, schools, offices, hotels, factories, warehouses, retail sites and residential communities. It supports the customer request-to-cash lifecycle and a separate internal operations workspace.

## Core workflows

- Customer requests and facility records
- Commercial quote creation and quote acceptance
- Contract conversion and recurring service planning
- Job scheduling, worker assignment, attendance check-in/check-out
- SOP/checklist generation and quality inspection
- Failed-inspection rework queue
- Invoice issuance, payment receipt recording and Razorpay checkout
- Tenant-scoped complaints, notifications and audit events
- Voice/typed service concierge in the customer portal

## Stack

- Next.js App Router and React
- PostgreSQL with Prisma migrations
- Cookie-based sessions with PBKDF2 password hashing
- GitHub Actions CI and production gate

## Local setup

1. Install Node.js 22+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set a real database URL and a long random `SESSION_SECRET`.
3. Install dependencies: `npm ci`
4. Generate Prisma client: `npm run db:generate`
5. Apply migrations: `npm run db:deploy`
6. Seed development data if needed: `npm run db:seed`
7. Run tests: `npm test`
8. Start development: `npm run dev`

For a production build, run `npm run build` then `npm start`.

## Production environment

Required:
- `DATABASE_URL`: managed PostgreSQL connection string
- `SESSION_SECRET`: long random secret; never reuse a sample or commit the real value
- `NEXT_PUBLIC_APP_URL`: canonical HTTPS application URL

Optional for online payments:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

The application applies payment signatures server-side and confirms the Razorpay payment is captured and matches the invoice amount before marking an invoice paid. Do not expose the secret in browser code. If Razorpay credentials are absent, online checkout is disabled and should report that configuration is missing.

## Release checklist

- Configure production secrets and managed PostgreSQL.
- Back up the database before applying migrations.
- Deploy the application and verify `/api/health` and `/api/ready`.
- Set the GitHub repository secret `STAGING_BASE_URL` to a real HTTPS staging deployment URL to enable external staging smoke checks.
- Configure Razorpay credentials and run a test-mode payment end-to-end before enabling live keys.
- Verify email/SMS/WhatsApp provider credentials before promising outbound notifications; in-app notifications are persisted.
- Test tenant isolation, customer onboarding, quote acceptance, contracts, assignment, QA/rework and invoice payment using separate customer and operations accounts.

## Important boundaries

A successful CI run verifies migration, tests and production build in the CI environment; it does not prove a live deployment is reachable. Payment collection requires the account owner to configure Razorpay credentials. External provider accounts, DNS, legal approvals and production data cannot be created from repository code alone.
