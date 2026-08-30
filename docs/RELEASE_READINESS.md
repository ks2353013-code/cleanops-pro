# CleanOps Pro — Release Readiness Gate

## Operational release

The application is ready for customer pilot only when all of the following are true:

- [ ] Production PostgreSQL provisioned and migrations applied
- [ ] Strong production session secret configured
- [ ] All tenant-scoped routes derive organization from authenticated identity
- [ ] Client request/facility workflows persist to the production database
- [ ] Operations can assess, quote, contract, schedule and dispatch
- [ ] Professional can view only their assigned jobs
- [ ] Check-in/check-out writes authoritative job state
- [ ] Required SOP/evidence rules are enforced
- [ ] QA failure creates auditable corrective action/rework
- [ ] Invoice totals use exact money representation
- [ ] Payment callbacks are signature-verified and idempotent
- [ ] Notifications have retry/error handling
- [ ] Evidence/documents use protected object storage
- [ ] Audit events are generated for privileged mutations
- [ ] Backups and restore procedure tested
- [ ] Health/readiness monitoring configured
- [ ] CI passes lint/test/build/migration checks
- [ ] End-to-end staging test passes for school, healthcare and office scenarios

## Pilot acceptance scenarios

### School
Create a facility, submit recurring cleaning request, quote, approve, schedule a team, complete checklist, record evidence, inspect, invoice and raise a corrective action.

### Healthcare
Create a restricted facility, apply configurable PPE/access requirements, assign eligible professional, complete service, capture incident/evidence, inspect and invoice. The platform must not represent internal checklist completion as statutory certification.

### Office
Create recurring janitorial contract, generate multiple scheduled jobs, handle an exception/no-show, replace the worker, preserve assignment history, complete QA and invoice.

## Deployment principle

A green build is not the same as a green production deployment. Deployment is complete only after migrations, environment configuration, smoke tests and database readiness have been verified against the deployed service.
