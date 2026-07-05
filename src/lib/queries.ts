// Shared read-side queries for public pages.

import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

export const PAGE_SIZE = 25;

export interface RankingFilters {
  roleGroup?: string;
  industry?: string; // industry slug
  nationality?: string;
  seniority?: string;
  page?: number;
}

export function rankingWhere(f: RankingFilters): Prisma.ProfessionalWhereInput {
  return {
    ...(f.roleGroup ? { roleGroup: f.roleGroup } : {}),
    ...(f.seniority ? { seniority: f.seniority } : {}),
    ...(f.nationality ? { nationality: f.nationality } : {}),
    ...(f.industry ? { currentCompany: { industry: { slug: f.industry } } } : {}),
  };
}

export async function getRankings(f: RankingFilters) {
  const page = Math.max(1, f.page ?? 1);
  const where = rankingWhere(f);
  const [total, professionals] = await Promise.all([
    prisma.professional.count({ where }),
    prisma.professional.findMany({
      where,
      orderBy: [{ currentMarketValue: "desc" }, { lastName: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { currentCompany: { include: { industry: true } } },
    }),
  ]);
  return { total, professionals, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Sum of current roster market values per company. */
export async function companyRosterValue(companyId: string): Promise<number> {
  const agg = await prisma.professional.aggregate({
    where: { currentCompanyId: companyId },
    _sum: { currentMarketValue: true },
  });
  return agg._sum.currentMarketValue ?? 0;
}

/** Hiring spend (sum of transfer packages) per industry over the last 365 days. */
export async function industrySpending(): Promise<
  { industryId: string; name: string; slug: string; spend: number }[]
> {
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const industries = await prisma.industry.findMany({ orderBy: { name: "asc" } });
  const transfers = await prisma.transfer.findMany({
    where: { transferDate: { gte: oneYearAgo }, toCompanyId: { not: null } },
    include: { toCompany: { select: { industryId: true } } },
  });
  const spendByIndustry = new Map<string, number>();
  for (const tr of transfers) {
    const iid = tr.toCompany?.industryId;
    if (!iid) continue;
    spendByIndustry.set(iid, (spendByIndustry.get(iid) ?? 0) + tr.package);
  }
  return industries
    .map((i) => ({ industryId: i.id, name: i.name, slug: i.slug, spend: spendByIndustry.get(i.id) ?? 0 }))
    .sort((a, b) => b.spend - a.spend);
}
