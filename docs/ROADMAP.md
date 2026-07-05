# ProfessionalMarket — Roadmap & Backlog

GitHub Issues is the source of truth for tracking. Hierarchy: **Milestone → Epic
(issue) → Feature/User story (sub-issue)**. Milestones are encoded as labels
(`M1`…`M4`) plus this document, since milestone objects are managed here.

## Milestone M1 — Foundation (Week 1)
Goal: repo, documentation, schema, seed data, walking skeleton.

- **EPIC E1: Core domain & data platform**
  - F1.1 Prisma schema for full domain model
  - F1.2 Seed generator: ~8 industries, ~24 companies, ~120 professionals, transfers, value history, rumors, news
  - F1.3 Domain service layer (transfer/value/rumor integrity rules)
  - F1.4 App scaffold: Next.js + Tailwind + layout shell + navigation

## Milestone M2 — Public Web App (Weeks 2-3)
Goal: full read-side product, Transfermarkt-equivalent pages.

- **EPIC E2: Profiles & directory**
  - S2.1 As a visitor I can view a professional profile (header box, value, contract, agency)
  - S2.2 As a visitor I can see market value history as a chart
  - S2.3 As a visitor I can see a professional's transfer history table
  - S2.4 As a visitor I can view a company profile with roster and total roster value
  - S2.5 As a visitor I can browse industries and their companies
- **EPIC E3: Search & rankings**
  - S3.1 As a recruiter I can search professionals and companies globally
  - S3.2 As a recruiter I can view "most valuable professionals" with filters + pagination
- **EPIC E4: Transfers & rumor mill**
  - S4.1 As a visitor I can browse latest transfers with packages
  - S4.2 As a visitor I can browse rumors with probability and status
  - S4.3 As a visitor I see a home page digest (latest transfers, top values, hot rumors, news, industry spending)

## Milestone M3 — Admin Panel (Week 4)
Goal: full back-office, data manageable without DB access.

- **EPIC E5: Admin panel**
  - S5.1 As an admin I can sign in securely and sign out (admin auth + middleware)
  - S5.2 As an admin I see a dashboard with KPIs and recent activity
  - S5.3 As an admin I can CRUD professionals
  - S5.4 As an admin I can CRUD companies
  - S5.5 As an admin I can record transfers (auto-updates current company)
  - S5.6 As an admin I can record market values (auto-updates current value)
  - S5.7 As an admin I can manage rumors and confirm/deny them (confirm creates transfer)
  - S5.8 As an admin I can publish news items

## Milestone M4 — Enterprise hardening (Weeks 5-6)
Goal: quality gates, security, ops-readiness for global rollout.

- **EPIC E6: Quality & CI**
  - S6.1 Unit tests for lib (formatting, age, slugs, auth signing)
  - S6.2 Integration tests for domain services against a test DB
  - S6.3 CI workflow: lint + test + build on push/PR
  - S6.4 Bug triage rounds: bugs filed as issues, fixed, closed
- **EPIC E7: Enterprise readiness**
  - S7.1 Security pass: admin route protection, input validation, no secrets in repo
  - S7.2 i18n-ready copy dictionary (EN v1, TR prepared)
  - S7.3 SEO & performance: metadata, semantic HTML, SSR everywhere
  - S7.4 Ops docs: Postgres migration path, env config, deployment guide

## Out of scope for v1 (icebox)
Community forum, premium subscriptions, native apps, real-data ingestion,
multi-tenant white-labeling, notification system.
