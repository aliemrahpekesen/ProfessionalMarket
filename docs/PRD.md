# ProfessionalMarket — Product Requirements Document

> "The Transfermarkt of the business world."

## 1. Vision

Transfermarkt made the football transfer market transparent: every player has a profile,
a market value with history, a transfer record, and a rumor mill with probabilities.
**ProfessionalMarket** brings the same transparency to the professional job market.

Instead of footballers we track **professionals** (engineers, designers, product managers,
executives). Instead of clubs we track **companies**. Instead of leagues we track
**industries**. Job changes are **transfers**, headhunters are **agents**, and market
values estimate a professional's yearly compensation worth — with full history charts.

## 2. Target users

| Persona | Need |
|---|---|
| Recruiter / Headhunter | Find professionals by role, seniority, value range; track move rumors |
| Hiring manager | Benchmark compensation, watch competitor hires |
| Professional | Track own market value, compare with peers, follow companies |
| Analyst / Journalist | Industry-level transfer spending, rankings, trends |
| Platform admin | Curate data: profiles, companies, transfers, rumors, valuations |

## 3. Transfermarkt → ProfessionalMarket mapping

| Transfermarkt | ProfessionalMarket |
|---|---|
| Player | Professional |
| Club | Company |
| League (+ tier) | Industry (+ company tier: Startup → Enterprise → Fortune 500) |
| Position (ST, CB, GK…) | Role (Backend Engineer, CTO, PM…) grouped by function |
| Market value (€) + history chart | Market value (USD/year) + history chart |
| Transfer (fee, loan, free) | Job move (hire, secondment/contract, free agent signing) |
| Transfer window | Hiring seasons |
| Contract until | Contract / notice period |
| Agent | Recruiter agency |
| Transfer rumors with probability % | Move rumors with probability % |
| Player stats (goals, assists) | Career stats (years exp., team size, projects, promotions) |
| Most valuable players ranking | Most valuable professionals ranking (filterable) |
| News feed | Market news feed |

## 4. Functional scope (v1)

### 4.1 Public web app
- **Home**: latest transfers, hottest rumors, top market values, market news,
  industry spending widget (like league spending sidebar).
- **Professional profile**: header box (photo, role, age, nationality, company,
  contract until, agency, current market value), market value history chart,
  transfer history table, career stats, achievements, active rumors.
- **Company profile**: header (logo, industry, HQ, founded, employee count, total
  roster value), roster of professionals, incoming/outgoing transfers, rumors.
- **Industry pages**: companies in industry with total roster values.
- **Rankings**: most valuable professionals with filters (role, industry, age,
  nationality, company) and pagination; view modes.
- **Transfers**: latest job moves with package details, filterable.
- **Rumors**: rumor mill with probability, status (hot/confirmed/denied).
- **Search**: global search across professionals and companies.

### 4.2 Admin panel (back office)
- Credential-protected `/admin` area.
- Dashboard KPIs (counts, latest activity).
- CRUD: professionals, companies, transfers, rumors, market value records, news.
- Data integrity: recording a transfer updates the professional's current company;
  market value records update the current value.

### 4.3 Enterprise readiness (v1 scope)
- Seed data generator for realistic demo dataset.
- Unit + integration tests, CI-ready scripts.
- i18n-ready copy structure (English UI v1; TR planned).
- Role-based access: public read, admin write.
- Audit-friendly: timestamps on all mutations.

## 5. Non-goals (v1)
- Real scraped data of real people (fictional seed data only — privacy first).
- Native mobile apps, payments/premium tiers, forums/community, live match-style feeds.
- Multi-region deployment automation (documented, not implemented).

## 6. Success metrics
- All public pages render server-side with < 1s TTFB on seed dataset.
- Admin can complete every CRUD flow without touching the DB directly.
- `npm test` and `npm run build` green; zero known P0/P1 bugs open at ship.

## 7. Legal / ethical note
All seeded people, companies and values are **fictional**. The product concept is an
homage to Transfermarkt's UX patterns, not a copy of its brand, data or assets.
