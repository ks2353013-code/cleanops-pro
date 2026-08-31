# CleanOps Pro — Production Deployment Runbook

## Target

Containerized Next.js application + managed PostgreSQL. The application runs migrations on container startup and exposes `/api/health` for load-balancer health checks.

## Required environment

- `DATABASE_URL`: production PostgreSQL connection string.
- `SESSION_SECRET`: long random secret, minimum 32 bytes recommended.
- `NEXT_PUBLIC_APP_URL`: canonical HTTPS application URL.

Never commit real secrets or production credentials.

## Build

```bash
npm ci
npx prisma generate
npm run build
```

## Database

```bash
npx prisma migrate deploy
```

Run migrations against a backup-protected production database. Do not use `prisma migrate dev` in production.

## Container

The repository Dockerfile uses Node 22 Alpine, installs production dependencies through the lockfile, generates Prisma Client, builds Next.js, and starts the production server after applying migrations. The health endpoint should be configured as the deployment health check.

## Release gate

1. CI is green.
2. Database backup exists.
3. Environment variables are present.
4. Migration deploy succeeds.
5. `/api/health` returns HTTP 200.
6. Login/logout works.
7. Tenant isolation tests pass.
8. Client request → quote → contract → job workflow passes.
9. Professional check-in/out and inspection workflow passes.
10. Invoice/payment workflow passes.
11. Error logs and database monitoring are enabled.

## Recommended hosting

The app is portable to any Docker-compatible host. A practical first production setup is a managed PostgreSQL provider plus a managed container host with HTTPS, automatic deploys from GitHub, health checks and environment secrets. Keep PostgreSQL separate from the application container.

## Rollback

Deploy the previous known-good image/commit. Never roll back a database schema blindly; migrations must be backward-compatible for rolling deployments.
