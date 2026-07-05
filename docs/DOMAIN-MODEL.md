# ProfessionalMarket — Domain Model

## Entities

### Industry (≈ League)
- `id`, `name` (Technology, Finance, Healthcare, Energy, Retail, Media…)
- `slug`, `description`
- Derived: total market value of companies' rosters, transfer spending.

### Company (≈ Club)
- `id`, `name`, `slug`, `logoColor` (generated monogram avatar), `industryId`
- `hqCity`, `hqCountry`, `foundedYear`, `employeeCount`, `website`
- `tier`: `STARTUP | SCALEUP | ENTERPRISE | FORTUNE500`
- Derived: roster (current professionals), total roster value, transfer record.

### Agency (≈ Player agent)
- `id`, `name`, `slug`, `website`
- Represents professionals in negotiations (headhunter / talent agency).

### Professional (≈ Player)
- `id`, `slug`, `firstName`, `lastName`, `headshotColor`
- `birthDate`, `nationality` (ISO country), `city`
- `role` (e.g. "Staff Backend Engineer"), `roleGroup`:
  `ENGINEERING | PRODUCT | DESIGN | DATA | MARKETING | SALES | OPERATIONS | FINANCE | EXECUTIVE`
- `seniority`: `JUNIOR | MID | SENIOR | STAFF | PRINCIPAL | DIRECTOR | VP | CLEVEL`
- `currentCompanyId?` (null = **free agent**, like unemployed player)
- `agencyId?`, `contractUntil?`, `openToOffers` (bool)
- `currentMarketValue` (int USD/year, derived from latest MarketValueRecord)
- `skills` (string list), `bio`
- Derived: age, transfer history, value history, career stats, rumors.

### MarketValueRecord (≈ Market value history point)
- `id`, `professionalId`, `value` (int USD/year), `recordedAt`, `note?`
- Append-only. Latest record defines `Professional.currentMarketValue`.

### Transfer (≈ Transfer)
- `id`, `professionalId`, `fromCompanyId?` (null = free agent),
  `toCompanyId?` (null = leaving to free agency)
- `transferDate`, `type`: `HIRE | CONTRACT | SECONDMENT | PROMOTION | FREE_AGENT`
- `package` (int USD/year total comp agreed; 0 allowed), `marketValueAtTransfer`
- `roleAfter?` (new title), `note?`

### Rumor (≈ Transfer rumor)
- `id`, `professionalId`, `targetCompanyId`
- `probability` (0–100), `status`: `HOT | WARMING | COLD | CONFIRMED | DENIED`
- `source?`, `note?`, `createdAt`, `updatedAt`
- Confirming a rumor can create the Transfer (admin action).

### CareerStat (≈ Season stats)
- `id`, `professionalId`, `year`
- `teamSize` (people led), `projectsDelivered`, `certifications`, `talksGiven`

### Achievement (≈ Trophies)
- `id`, `name`, `year`, `professionalId` (e.g. "Forbes 30 Under 30", "Patent granted")

### NewsItem (≈ News feed)
- `id`, `title`, `slug`, `body`, `publishedAt`
- `professionalId?`, `companyId?`

## Business rules

1. **Current company**: after inserting a transfer, if it is the professional's most
   recent one, set `currentCompanyId = toCompanyId` and `role = roleAfter ?? role`.
2. **Current market value** = value of the newest `MarketValueRecord`; stored
   denormalized on Professional for cheap ranking queries, always updated in the
   same operation (service layer).
3. **Free agent**: `currentCompanyId = null`. Shows as "Free agent" (like "Vereinslos").
4. **Rumor confirmation**: sets `status=CONFIRMED` and creates a Transfer
   (type `HIRE`) dated at confirmation time; probability forced to 100.
5. **Rumor denial**: `status=DENIED`, probability forced to 0.
6. **Value formatting**: `$180k`, `$1.25m`, `$12.5m` (thousands/millions, 2 sig. decimals).
7. **Age** computed from `birthDate` at render time (UTC date math).

## Ranking queries
- Most valuable professionals: order by `currentMarketValue` desc, filter by
  roleGroup / industry / nationality / age band / company; paginated 25/page.
- Company roster value: sum of roster `currentMarketValue`.
- Industry spending: sum of `Transfer.package` in the last 365 days for companies
  in the industry (like league spending sidebar).
