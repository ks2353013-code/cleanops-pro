# CleanOps Pro — Integrated Fast Flow

The first operating release is designed around one closed loop:

**Client request → facility validation → assessment → quote → contract → schedule → dispatch → professional check-in → SOP/evidence → QA → completion → invoice → collection → renewal**

## Operating roles

- **Client Manager:** manages facilities, service requests, approvals, service visibility and invoices.
- **Operations Manager:** owns assessment, quotes, contracts, scheduling, dispatch, exceptions and margin.
- **Supervisor:** owns workforce, inspections, rework and corrective actions.
- **Professional:** owns availability, assigned jobs, check-in/out, SOP execution, evidence and incidents.
- **Platform Admin:** owns organizations, roles, global policies and system health.

## Launch principle

The platform must make the common path fast while forcing controls only where risk requires them. A routine office job should be quick; a hospital job should collect the additional qualification, PPE, restricted-zone and evidence requirements.

## Current repository architecture

Next.js App Router + Prisma + PostgreSQL, with dedicated client, professional and admin surfaces and API routes. CI validates dependency installation, Prisma generation/migration, tests and production build.

## Production dependencies

Before live customer use, configure a managed PostgreSQL database, secure session secret, HTTPS domain, transactional email, object storage for evidence, monitoring/error reporting and backup/recovery. Payment processing is optional for first pilot if invoices are handled externally, but payment records must remain auditable once integrated.
