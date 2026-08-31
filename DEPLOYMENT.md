# CleanOps Pro Deployment

## Recommended production model

- App: containerized Next.js application
- Database: managed PostgreSQL (Neon, Supabase, Railway, Render PostgreSQL, or equivalent)
- HTTPS: managed by deployment platform / reverse proxy
- Secrets: platform secret manager; never commit `.env`
- Database migrations: `npm run db:deploy` during release
- Health endpoint: `/api/health`
- Logs: platform-managed centralized logs

## Docker

`docker compose up --build` starts the application and PostgreSQL locally. For production, use a managed PostgreSQL instance and set `DATABASE_URL` and a long random `SESSION_SECRET`.

## Render / Railway / Fly / VPS

Build command: `npm ci && npx prisma generate && npm run build`
Start command: `npm run db:deploy && npm start`
Node: 22+
Port: `3000` (or platform-provided `$PORT`)

## Production gates

Before accepting real customers: configure managed DB backups, domain/HTTPS, secret rotation, email/SMS provider, object storage for evidence uploads, payment provider, error monitoring, rate limiting, database connection limits, and an external security review.

Do not use development credentials or the compose database in production.
