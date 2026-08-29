# CleanOps Pro — Release Checklist

## Application
- [ ] Client registration creates an organization and authenticated user.
- [ ] Login/logout works and invalid credentials fail safely.
- [ ] Every organization-scoped read/write enforces tenant ownership.
- [ ] Roles enforce least privilege: admin, operations, supervisor, client manager, professional.
- [ ] Facility onboarding works for supported facility types.
- [ ] Site assessment feeds quote calculations.
- [ ] Quote approval creates/updates the commercial workflow.
- [ ] Contracts have dates, SLA tier and renewal behavior.
- [ ] Recurring schedules create expected work occurrences.
- [ ] Dispatch ranks eligible workers and supports replacement.
- [ ] Professionals can check in/out and complete SOPs.
- [ ] Evidence is attached to the correct job and tenant.
- [ ] Quality failures create corrective actions.
- [ ] Invoices calculate correctly and collections are tracked.
- [ ] Complaints have severity, owner, SLA and closure evidence.
- [ ] Inventory and equipment movements are auditable.

## Security
- [ ] Production secrets are outside source control.
- [ ] HTTPS is enforced by hosting platform.
- [ ] Authentication cookies are secure, HttpOnly and appropriately scoped.
- [ ] CSRF protection is enabled for cookie-authenticated mutations.
- [ ] Rate limits cover login and sensitive endpoints.
- [ ] Upload MIME/size checks are enforced server-side.
- [ ] Audit logs exist for privileged actions.
- [ ] Backups and database recovery are tested.

## Deployment
- [ ] CI passes install, Prisma generation, lint/test and build.
- [ ] Production migration is tested against a staging database.
- [ ] `prisma migrate deploy` succeeds in production.
- [ ] `/api/health` returns 200.
- [ ] Database connection pool is configured for production limits.
- [ ] Logs, error monitoring and uptime alerts are enabled.
- [ ] Rollback procedure has been tested.

## Business acceptance
- [ ] School scenario passes end-to-end.
- [ ] Hospital scenario passes end-to-end with appropriate restricted workflows.
- [ ] Office scenario passes end-to-end.
- [ ] Hotel scenario passes end-to-end.
- [ ] Factory/warehouse scenario passes end-to-end.
- [ ] Emergency cleaning scenario passes.
- [ ] No-show/replacement scenario passes.
- [ ] Complaint/rework scenario passes.
- [ ] Contract renewal scenario passes.
- [ ] Invoice/collection scenario passes.

A feature is not production-ready until its workflow, authorization, persistence, error handling and acceptance test all pass.
