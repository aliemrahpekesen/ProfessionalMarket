// Deterministic seed: fictional industries, companies, agencies, professionals,
// market value history, transfers, rumors, career stats, achievements, news.
// All data is invented — no real people or companies.

import { PrismaClient } from "@prisma/client";
import { createTransfer, addMarketValue } from "../src/lib/domain";
import { slugify } from "../src/lib/slug";
import { ROLE_GROUPS, SENIORITIES } from "../src/lib/constants";

const prisma = new PrismaClient();

// mulberry32 — deterministic RNG so every seed run produces the same world.
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260705);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const NOW = new Date("2026-07-05T00:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

const INDUSTRIES = [
  ["Technology", "Software, cloud and internet platforms"],
  ["Finance", "Banking, fintech and asset management"],
  ["Healthcare", "Health tech, pharma and care providers"],
  ["Energy", "Renewables, utilities and grid technology"],
  ["Retail", "Commerce, marketplaces and consumer brands"],
  ["Media", "Streaming, publishing and entertainment"],
  ["Logistics", "Supply chain, mobility and delivery"],
  ["Aerospace", "Aviation, space and defense technology"],
] as const;

const COMPANIES: [string, string, string, string, number][] = [
  // name, tier, hqCity, hqCountry, foundedYear
  ["Nexora Systems", "FORTUNE500", "San Francisco", "US", 1998],
  ["Quantivo", "ENTERPRISE", "Berlin", "DE", 2008],
  ["CloudMesa", "SCALEUP", "Austin", "US", 2016],
  ["ByteHarbor", "STARTUP", "Istanbul", "TR", 2021],
  ["Meridian Capital Group", "FORTUNE500", "London", "GB", 1985],
  ["FinchPay", "SCALEUP", "Amsterdam", "NL", 2017],
  ["Aurelia Bank", "ENTERPRISE", "Paris", "FR", 1952],
  ["LedgerLoop", "STARTUP", "Singapore", "SG", 2022],
  ["VitalCore Health", "ENTERPRISE", "Boston", "US", 1990],
  ["Genomiq", "SCALEUP", "Stockholm", "SE", 2015],
  ["CarePilot", "STARTUP", "Toronto", "CA", 2020],
  ["Heliovolt Energy", "ENTERPRISE", "Madrid", "ES", 2001],
  ["GridNova", "SCALEUP", "Munich", "DE", 2014],
  ["TerraWatt Labs", "STARTUP", "Ankara", "TR", 2023],
  ["Marketon", "FORTUNE500", "Seattle", "US", 1994],
  ["Cartveyor", "SCALEUP", "São Paulo", "BR", 2018],
  ["Bazario", "ENTERPRISE", "Dubai", "AE", 2005],
  ["StreamForge Media", "ENTERPRISE", "Los Angeles", "US", 2007],
  ["Pressly", "STARTUP", "Warsaw", "PL", 2021],
  ["OrbitCast", "SCALEUP", "Seoul", "KR", 2013],
  ["SwiftHaul Logistics", "ENTERPRISE", "Rotterdam", "NL", 1996],
  ["Kargonet", "SCALEUP", "Izmir", "TR", 2016],
  ["AeroDyne Industries", "FORTUNE500", "Toulouse", "FR", 1972],
  ["StellarForge", "STARTUP", "Tokyo", "JP", 2022],
];
// company index → industry index
const COMPANY_INDUSTRY = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7];

const AGENCIES = [
  "Apex Talent Partners",
  "Northstar Executive Search",
  "Vanguard Recruiting",
  "Elevate Search Group",
  "Bosphorus Talent",
  "Zenith Headhunters",
];

const FIRST_NAMES = [
  "Emre", "Zeynep", "Mert", "Elif", "Kaan", "Selin", "Deniz", "Ayşe",
  "James", "Olivia", "Liam", "Sophie", "Noah", "Emma", "Lucas", "Mia",
  "Yuki", "Hana", "Kenji", "Mateus", "Ana", "Rafael", "Camila", "Diego",
  "Lars", "Freja", "Anna", "Piotr", "Ingrid", "Chloé", "Louis", "Marta",
  "Aisha", "Omar", "Priya", "Arjun", "Mei", "Jin", "Sana", "Tariq",
];
const LAST_NAMES = [
  "Yılmaz", "Demir", "Kaya", "Şahin", "Çelik", "Aydın",
  "Smith", "Johnson", "Brown", "Taylor", "Wilson", "Clarke",
  "Müller", "Schmidt", "Weber", "Fischer", "Novak", "Kowalski",
  "Tanaka", "Sato", "Kim", "Park", "Silva", "Santos",
  "García", "Rossi", "Dubois", "Lefèvre", "Jansen", "de Vries",
  "Andersson", "Nilsson", "Haddad", "Rahman", "Patel", "Sharma",
];
const NATIONALITIES = ["TR", "US", "GB", "DE", "FR", "NL", "ES", "IT", "SE", "PL", "IN", "BR", "JP", "SG", "AE", "CA", "AU", "KR"];

const ROLES: Record<string, string[]> = {
  ENGINEERING: ["Backend Engineer", "Frontend Engineer", "Platform Engineer", "Mobile Engineer", "DevOps Engineer", "Security Engineer"],
  PRODUCT: ["Product Manager", "Product Lead", "Growth PM", "Technical PM"],
  DESIGN: ["Product Designer", "UX Researcher", "Design Lead", "Brand Designer"],
  DATA: ["Data Scientist", "Data Engineer", "ML Engineer", "Analytics Lead"],
  MARKETING: ["Marketing Manager", "Content Strategist", "SEO Lead", "Brand Manager"],
  SALES: ["Account Executive", "Sales Director", "Solutions Engineer", "Partnerships Manager"],
  OPERATIONS: ["Operations Manager", "Program Manager", "Chief of Staff", "Supply Chain Lead"],
  FINANCE: ["Financial Analyst", "Controller", "FP&A Manager", "Treasury Lead"],
  EXECUTIVE: ["CTO", "CPO", "CFO", "COO", "CEO", "VP Engineering", "VP Product"],
};

const SKILLS: Record<string, string[]> = {
  ENGINEERING: ["TypeScript", "Go", "Kubernetes", "PostgreSQL", "AWS", "Rust", "GraphQL", "Terraform"],
  PRODUCT: ["Roadmapping", "Discovery", "A/B testing", "SQL", "Stakeholder management"],
  DESIGN: ["Figma", "Design systems", "Prototyping", "User research", "Accessibility"],
  DATA: ["Python", "SQL", "Spark", "dbt", "MLOps", "TensorFlow"],
  MARKETING: ["SEO", "Paid media", "Analytics", "CRM", "Copywriting"],
  SALES: ["Enterprise sales", "Negotiation", "Salesforce", "Forecasting"],
  OPERATIONS: ["Process design", "Lean", "OKRs", "Vendor management"],
  FINANCE: ["Modeling", "IFRS", "Budgeting", "M&A", "Excel"],
  EXECUTIVE: ["Strategy", "Fundraising", "Org design", "Public speaking", "M&A"],
};

// Base yearly value by seniority (USD), before role-group multiplier & noise.
const SENIORITY_BASE: Record<string, number> = {
  JUNIOR: 60_000, MID: 95_000, SENIOR: 140_000, STAFF: 190_000,
  PRINCIPAL: 240_000, DIRECTOR: 300_000, VP: 420_000, CLEVEL: 650_000,
};
const GROUP_MULT: Record<string, number> = {
  ENGINEERING: 1.15, PRODUCT: 1.1, DESIGN: 0.95, DATA: 1.2, MARKETING: 0.85,
  SALES: 1.0, OPERATIONS: 0.9, FINANCE: 1.05, EXECUTIVE: 1.3,
};

const ACHIEVEMENT_POOL = [
  "Forbes 30 Under 30", "Patent granted", "Industry Innovator Award", "Top Voice",
  "Hackathon Grand Prize", "Keynote speaker — GlobalTech Summit", "Open-source maintainer of the year",
  "40 Under 40", "Best Product Launch Award", "CIO Excellence Award",
];

async function main() {
  console.log("Seeding ProfessionalMarket…");

  // Reset previous seed data (dependency order) so the seed is re-runnable.
  await prisma.newsItem.deleteMany();
  await prisma.rumor.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.careerStat.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.marketValueRecord.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.agency.deleteMany();
  await prisma.company.deleteMany();
  await prisma.industry.deleteMany();

  // Industries
  const industries = [];
  for (const [name, description] of INDUSTRIES) {
    industries.push(
      await prisma.industry.create({ data: { name, description, slug: slugify(name) } }),
    );
  }

  // Companies
  const companies = [];
  const palette = ["#00193f", "#0b4f9e", "#1d7a46", "#7a1d1d", "#5b21b6", "#9a3412", "#0f766e", "#a21caf"];
  for (let i = 0; i < COMPANIES.length; i += 1) {
    const [name, tier, hqCity, hqCountry, foundedYear] = COMPANIES[i];
    companies.push(
      await prisma.company.create({
        data: {
          name,
          slug: slugify(name),
          tier,
          hqCity,
          hqCountry,
          foundedYear,
          employeeCount: randInt(30, 120_000),
          website: `https://www.${slugify(name).replace(/-/g, "")}.example.com`,
          logoColor: palette[i % palette.length],
          industryId: industries[COMPANY_INDUSTRY[i]].id,
        },
      }),
    );
  }

  // Agencies
  const agencies = [];
  for (const name of AGENCIES) {
    agencies.push(await prisma.agency.create({ data: { name, slug: slugify(name) } }));
  }

  // Professionals with history
  const usedNames = new Set<string>();
  const professionals = [];
  for (let i = 0; i < 120; i += 1) {
    let firstName = pick(FIRST_NAMES);
    let lastName = pick(LAST_NAMES);
    let guard = 0;
    while (usedNames.has(`${firstName} ${lastName}`) && guard < 50) {
      firstName = pick(FIRST_NAMES);
      lastName = pick(LAST_NAMES);
      guard += 1;
    }
    usedNames.add(`${firstName} ${lastName}`);

    const roleGroup = pick(ROLE_GROUPS);
    const seniority = pick(SENIORITIES);
    const role = `${seniority === "JUNIOR" ? "Junior " : seniority === "SENIOR" ? "Senior " : ""}${pick(ROLES[roleGroup])}`;
    const age = randInt(23, 58);
    const birthDate = new Date(Date.UTC(NOW.getUTCFullYear() - age, randInt(0, 11), randInt(1, 28)));
    const skills = [...new Set(Array.from({ length: randInt(3, 5) }, () => pick(SKILLS[roleGroup])))];
    const slugBase = slugify(`${firstName} ${lastName}`);

    const professional = await prisma.professional.create({
      data: {
        firstName,
        lastName,
        slug: `${slugBase}-${i + 1}`,
        birthDate,
        nationality: pick(NATIONALITIES),
        city: pick(["Istanbul", "London", "Berlin", "San Francisco", "Amsterdam", "Tokyo", "Dubai", "Warsaw", "Seoul", "Toronto"]),
        role,
        roleGroup,
        seniority,
        bio: `${firstName} is a ${role.toLowerCase()} known for high-impact work across the ${roleGroup.toLowerCase()} space.`,
        skills: skills.join(","),
        openToOffers: rand() < 0.3,
        contractUntil: rand() < 0.75 ? daysAgo(-randInt(90, 1200)) : null,
        agencyId: rand() < 0.6 ? pick(agencies).id : null,
        headshotColor: pick(["#334155", "#7c2d12", "#14532d", "#1e3a8a", "#581c87", "#701a75", "#134e4a"]),
      },
    });

    // Market value history: 3-6 records over the last ~3 years.
    const base = SENIORITY_BASE[seniority] * GROUP_MULT[roleGroup];
    const records = randInt(3, 6);
    let value = base * (0.7 + rand() * 0.3);
    for (let r = records - 1; r >= 0; r -= 1) {
      value *= 1 + (rand() * 0.28 - 0.06); // mostly upward drift
      await addMarketValue(prisma, {
        professionalId: professional.id,
        value: Math.round(value / 1000) * 1000,
        recordedAt: daysAgo(r * randInt(140, 220) + randInt(0, 60)),
        note: r === 0 ? "Latest market review" : "",
      });
    }

    // Career: 1-4 transfers ending at a current company (85%) or free agency.
    const moves = randInt(1, 4);
    let from: string | null = null;
    for (let m = 0; m < moves; m += 1) {
      const isLast = m === moves - 1;
      const stayUnemployed = isLast && rand() < 0.15;
      const to = stayUnemployed ? null : pick(companies).id;
      await createTransfer(prisma, {
        professionalId: professional.id,
        fromCompanyId: from,
        toCompanyId: to,
        transferDate: daysAgo((moves - m) * randInt(250, 500) - randInt(0, 200)),
        type: stayUnemployed ? "FREE_AGENT" : from === null ? "HIRE" : pick(["HIRE", "HIRE", "CONTRACT", "SECONDMENT"]),
        package: Math.round((value * (0.9 + rand() * 0.25)) / 1000) * 1000,
        roleAfter: isLast ? role : "",
      });
      from = to;
    }

    // Career stats for the last 2-4 years.
    const statYears = randInt(2, 4);
    for (let y = 0; y < statYears; y += 1) {
      await prisma.careerStat.create({
        data: {
          professionalId: professional.id,
          year: NOW.getUTCFullYear() - y,
          teamSize: randInt(0, 40),
          projectsDelivered: randInt(1, 12),
          certifications: randInt(0, 3),
          talksGiven: randInt(0, 8),
        },
      });
    }

    if (rand() < 0.4) {
      await prisma.achievement.create({
        data: {
          professionalId: professional.id,
          name: pick(ACHIEVEMENT_POOL),
          year: randInt(2018, 2026),
        },
      });
    }

    professionals.push(professional);
  }

  // Rumors: 30 open rumors targeting a different company than current.
  for (let i = 0; i < 30; i += 1) {
    const professional = pick(professionals);
    const current = await prisma.professional.findUniqueOrThrow({ where: { id: professional.id } });
    let target = pick(companies);
    let guard = 0;
    while (target.id === current.currentCompanyId && guard < 10) {
      target = pick(companies);
      guard += 1;
    }
    const probability = randInt(15, 95);
    await prisma.rumor.create({
      data: {
        professionalId: professional.id,
        targetCompanyId: target.id,
        probability,
        status: probability >= 70 ? "HOT" : probability >= 40 ? "WARMING" : "COLD",
        source: pick(["Industry insider", "Community forum", "Press report", "Conference chatter"]),
        note: "Sources report advanced conversations.",
        createdAt: daysAgo(randInt(1, 60)),
      },
    });
  }

  // News
  const headlines: [string, string | null, string | null][] = [];
  for (let i = 0; i < 12; i += 1) {
    const professional = pick(professionals);
    const company = pick(companies);
    headlines.push([
      pick([
        `${professional.firstName} ${professional.lastName} linked with a blockbuster move to ${company.name}`,
        `${company.name} announces record hiring budget for next quarter`,
        `Market value update: ${professional.firstName} ${professional.lastName} on the rise`,
        `${company.name} confirms leadership reshuffle`,
      ]),
      professional.id,
      company.id,
    ]);
  }
  for (let i = 0; i < headlines.length; i += 1) {
    const [title, professionalId, companyId] = headlines[i];
    await prisma.newsItem.create({
      data: {
        title,
        slug: `${slugify(title).slice(0, 60)}-${i + 1}`,
        body: `${title}. Analysts say this reflects the accelerating talent market, with compensation packages climbing across the industry. More details are expected in the coming weeks.`,
        publishedAt: daysAgo(randInt(0, 30)),
        professionalId: rand() < 0.7 ? professionalId : null,
        companyId: rand() < 0.7 ? companyId : null,
      },
    });
  }

  const counts = {
    industries: await prisma.industry.count(),
    companies: await prisma.company.count(),
    agencies: await prisma.agency.count(),
    professionals: await prisma.professional.count(),
    marketValues: await prisma.marketValueRecord.count(),
    transfers: await prisma.transfer.count(),
    rumors: await prisma.rumor.count(),
    news: await prisma.newsItem.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
