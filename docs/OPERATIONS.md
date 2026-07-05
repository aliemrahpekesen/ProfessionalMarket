# ProfessionalMarket — Operations Guide

## Environment configuration

Copy `.env.example` → `.env` and set:

| Variable | Purpose | Production guidance |
|---|---|---|
| `DATABASE_URL` | Prisma datasource | Use PostgreSQL (see below) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Back-office credentials | Strong unique values, rotate regularly; replace with SSO for enterprise |
| `AUTH_SECRET` | HMAC key for session cookies | ≥32 random chars, e.g. `openssl rand -hex 32`; rotating it invalidates all sessions |

## Local / demo

```bash
cp .env.example .env
npm install
npm run db:setup      # prisma generate + db push + seed (fictional data)
npm run dev           # http://localhost:3000  (admin at /admin)
```

## Quality gates

```bash
npm run lint    # typecheck
npm test        # unit + integration (isolated prisma/test.db)
npm run build   # production build
node scripts/e2e-smoke.mjs   # Playwright admin E2E against a running server (PORT 3100)
```

CI (`.github/workflows/ci.yml`) runs lint + test + build on every push/PR.

## SQLite → PostgreSQL migration path

1. In `prisma/schema.prisma` set `provider = "postgresql"`.
2. Set `DATABASE_URL=postgresql://user:pass@host:5432/professionalmarket`.
3. `npx prisma migrate dev --name init` (dev) / `npx prisma migrate deploy` (prod).
4. No application-code changes are required: money is integer USD, enums are
   validated strings, and all queries go through Prisma.
5. Optional: move `skills` (comma-separated string) to a native `text[]` column.

## Deployment

Any Node 20+ host works (`npm run build && npm start`). Recommended shape:

- **App**: 2+ stateless instances behind a load balancer (session cookie is
  self-contained HMAC — no shared session store needed).
- **DB**: managed PostgreSQL with automated backups.
- **CDN**: public pages are SSR; add `revalidate` per route if you want
  edge caching of hot pages (rankings, home).
- **Secrets**: injected via the platform's secret manager, never committed.
- **Observability**: Next.js instrumentation hook + your APM of choice.

## Security notes

- `/admin/**` and `/api/admin/**` are gated by middleware (signed cookie),
  and every server action re-verifies the session and re-validates input.
- Credential comparison is constant-time; failed logins do not reveal which
  field was wrong.
- Session cookies: `HttpOnly`, `SameSite=Lax`, `Secure` in production, 8h TTL.
- For enterprise SSO, replace the seam in `src/lib/auth.ts` +
  `src/lib/adminSession.ts` with your OIDC provider; the rest of the admin
  panel only depends on `requireAdmin()`.

## Data ethics

The seed dataset is entirely fictional. If you ingest real professional data,
you are responsible for the legal basis (KVKK/GDPR): consent or legitimate
interest, right-to-erasure workflows, and data minimization.
