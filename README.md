# ProfessionalMarket

> The Transfermarkt of the business world — market values, transfers and rumors
> for professionals instead of footballers.

ProfessionalMarket is a full-stack web application inspired by
[transfermarkt.com.tr](https://www.transfermarkt.com.tr/)'s UX: every
**professional** has a profile with a **market value history chart**, a
**transfer (job move) history**, an **agency (headhunter)**, and a **rumor mill**
with probabilities. **Companies** play the role of clubs, **industries** the role
of leagues.

All seed data is fictional. See [docs/PRD.md](docs/PRD.md).

## Stack
Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · Prisma + SQLite
(PostgreSQL-ready) · Vitest. Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting started

```bash
npm install
npm run db:setup     # prisma generate + migrate + seed
npm run dev          # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin` — credentials come from env
(`.env`): `ADMIN_EMAIL`, `ADMIN_PASSWORD` (demo defaults in `.env.example`).

## Scripts
- `npm run dev` / `npm run build` / `npm start`
- `npm run db:setup` — generate client, apply schema, seed demo data
- `npm test` — unit + integration tests (Vitest)
- `npm run lint`

## Project management
Planned and tracked in GitHub Issues: epics → features/user stories via
sub-issues, milestones as `M1`–`M4` labels. Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md).

## Documentation
- [Product requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Domain model](docs/DOMAIN-MODEL.md)
- [Roadmap & backlog](docs/ROADMAP.md)
