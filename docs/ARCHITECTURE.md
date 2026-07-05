# ProfessionalMarket — Architecture

## 1. Stack decision

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | SSR for SEO-heavy content site (like Transfermarkt), API routes + server components in one deployable |
| Styling | Tailwind CSS v4 | Fast iteration, consistent design system |
| ORM / DB | Prisma + SQLite (dev/demo), PostgreSQL-ready schema | Zero-infra demo; swap `provider` for Postgres in production |
| Charts | Hand-rolled inline SVG | Market value history chart without client-side chart lib weight |
| Auth (admin) | Signed HTTP-only session cookie, credentials from env | Simple, dependency-free; swap for SSO/OIDC in enterprise deployment |
| Tests | Vitest (unit + integration against a test DB) | Fast, TS-native |
| Issue tracking | GitHub Issues (epics → features → user stories via sub-issues) | Single source of truth |

## 2. High-level structure

```
/                        Next.js app (single deployable)
├── prisma/
│   ├── schema.prisma    Domain schema
│   └── seed.ts          Fictional demo dataset generator
├── src/
│   ├── app/             App Router pages
│   │   ├── (public)/    Home, professionals, companies, industries,
│   │   │                rankings, transfers, rumors, search, news
│   │   ├── admin/       Admin panel (dashboard + CRUD)
│   │   └── api/         REST-ish route handlers used by admin forms
│   ├── components/      UI components (cards, tables, chart, nav)
│   ├── lib/             db client, auth, formatting, market-value logic
│   └── styles/
├── docs/                PRD, architecture, domain model, roadmap
└── tests/               Vitest unit + integration tests
```

## 3. Key design decisions

### 3.1 Server-first rendering
All public pages are React Server Components querying Prisma directly.
Interactive islands (search box, admin forms, filters) are client components.

### 3.2 Data integrity in one place
Transfer creation and market-value creation go through `src/lib/domain.ts`
service functions (used by both admin API routes and seed), which enforce:
- a transfer updates `Professional.currentCompanyId` when it is the newest transfer;
- a market value record updates `Professional.currentMarketValue`;
- rumor confirmation can generate the corresponding transfer.

### 3.3 Admin security
`middleware.ts` guards `/admin/**` and `/api/admin/**`; sessions are HMAC-signed
cookies (`ADMIN_EMAIL`/`ADMIN_PASSWORD`/`AUTH_SECRET` env vars). CSRF exposure kept
minimal: mutations are same-site POSTs; cookie is `SameSite=Lax`, `HttpOnly`.

### 3.4 Money & valuation
Market values stored as integer USD/year (no floats). Formatting helpers render
`$1.25m`-style values like Transfermarkt's `€1,25 mln.` Value history is an
append-only table — the chart and "current value" derive from it.

### 3.5 Enterprise path (documented, phased)
- SQLite → PostgreSQL: change datasource, run migrations.
- Cookie auth → OIDC (Auth0/Entra) behind the same `requireAdmin()` seam.
- i18n: all copy in `src/lib/i18n.ts` dictionary; locale routing later.
- Caching/CDN: pages are static-friendly; add `revalidate` per route.

## 4. Domain model (summary — full detail in DOMAIN-MODEL.md)

```
Industry 1—n Company 1—n Professional n—1 Agency
Professional 1—n MarketValueRecord
Professional 1—n Transfer (fromCompany, toCompany)
Professional 1—n Rumor (targetCompany, probability, status)
Professional 1—n CareerStat (per year)
Professional n—n Achievement
NewsItem (optionally linked to professional/company)
AdminUser (seeded from env at bootstrap)
```

## 5. Quality gates
- `npm run lint`, `npm test`, `npm run build` must pass before merge.
- Bugs found during test rounds are filed as GitHub issues labeled `bug`,
  fixed with commits referencing the issue, then closed.
