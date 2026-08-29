# Build Status

## Completed
- Repository and Next.js foundation
- Operations dashboard
- Health, request and worker API foundations
- Domain constants and normalization
- Client portal foundation
- Professional job-execution portal foundation
- Admin control-plane foundation
- PostgreSQL/Prisma domain direction
- Security/API documentation

## Current implementation track
1. Authentication and role-based access
2. Persistent CRUD for organizations/facilities/requests/workers
3. Quote and contract workflow
4. Job scheduling and assignment
5. Attendance and evidence
6. SOP/checklist/inspection engine
7. Invoicing and payment reconciliation
8. Notifications and audit trail
9. Production hardening and automated tests
10. AI operations after reliable data flows are established

## Product rule
Do not replace working modules with mock-only screens. Every new screen should map to a domain entity and a server-side operation. Demo seed data is acceptable for development, but production behavior must use persistence and authorization.
