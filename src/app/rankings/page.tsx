import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getRankings, PAGE_SIZE } from "@/lib/queries";
import { calcAge, formatMoney } from "@/lib/format";
import {
  COUNTRY_NAMES,
  ROLE_GROUPS,
  ROLE_GROUP_LABELS,
  SENIORITIES,
  SENIORITY_LABELS,
  countryName,
  type RoleGroup,
  type Seniority,
} from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/Section";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Most valuable professionals",
  description: "Ranking of the world's most valuable professionals by estimated yearly market value.",
};

type SP = { page?: string; roleGroup?: string; industry?: string; nationality?: string; seniority?: string };

export default async function RankingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters = {
    page: Math.max(1, Number(sp.page) || 1),
    roleGroup: sp.roleGroup || undefined,
    industry: sp.industry || undefined,
    nationality: sp.nationality || undefined,
    seniority: sp.seniority || undefined,
  };
  const [{ total, professionals, page, pageCount }, industries] = await Promise.all([
    getRankings(filters),
    prisma.industry.findMany({ orderBy: { name: "asc" } }),
  ]);

  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...sp, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    return `/rankings?${params.toString()}`;
  };

  return (
    <Section title={`Most valuable professionals (${total})`}>
      <form action="/rankings" className="flex flex-wrap items-end gap-2 border-b border-gray-100 p-3 text-sm">
        <label className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-gray-500">Function</span>
          <select name="roleGroup" defaultValue={filters.roleGroup ?? ""} className="rounded border border-gray-300 px-2 py-1">
            <option value="">All</option>
            {ROLE_GROUPS.map((g) => (
              <option key={g} value={g}>{ROLE_GROUP_LABELS[g as RoleGroup]}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-gray-500">Industry</span>
          <select name="industry" defaultValue={filters.industry ?? ""} className="rounded border border-gray-300 px-2 py-1">
            <option value="">All</option>
            {industries.map((i) => (
              <option key={i.id} value={i.slug}>{i.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-gray-500">Seniority</span>
          <select name="seniority" defaultValue={filters.seniority ?? ""} className="rounded border border-gray-300 px-2 py-1">
            <option value="">All</option>
            {SENIORITIES.map((s) => (
              <option key={s} value={s}>{SENIORITY_LABELS[s as Seniority]}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-gray-500">Nationality</span>
          <select name="nationality" defaultValue={filters.nationality ?? ""} className="rounded border border-gray-300 px-2 py-1">
            <option value="">All</option>
            {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </label>
        <button className="rounded bg-[var(--pm-navy)] px-3 py-1.5 font-semibold text-white">Apply</button>
        <Link href="/rankings" className="px-2 py-1.5 text-sky-800 hover:underline">Reset</Link>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Name</th>
            <th className="hidden px-3 py-2 sm:table-cell">Role</th>
            <th className="hidden px-3 py-2 md:table-cell">Age</th>
            <th className="hidden px-3 py-2 md:table-cell">Nationality</th>
            <th className="hidden px-3 py-2 sm:table-cell">Company</th>
            <th className="px-3 py-2 text-right">Market value</th>
          </tr>
        </thead>
        <tbody>
          {professionals.map((p, i) => (
            <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 text-xs font-bold text-gray-500">{(page - 1) * PAGE_SIZE + i + 1}</td>
              <td className="px-3 py-2">
                <Link href={`/professionals/${p.slug}`} className="flex items-center gap-2 font-semibold text-sky-800 hover:underline">
                  <Avatar name={`${p.firstName} ${p.lastName}`} color={p.headshotColor} size={28} />
                  {p.firstName} {p.lastName}
                </Link>
              </td>
              <td className="hidden px-3 py-2 text-gray-600 sm:table-cell">{p.role}</td>
              <td className="hidden px-3 py-2 md:table-cell">{calcAge(p.birthDate)}</td>
              <td className="hidden px-3 py-2 md:table-cell">{countryName(p.nationality)}</td>
              <td className="hidden px-3 py-2 sm:table-cell">
                {p.currentCompany ? (
                  <Link href={`/companies/${p.currentCompany.slug}`} className="text-sky-800 hover:underline">
                    {p.currentCompany.name}
                  </Link>
                ) : ("Free agent")}
              </td>
              <td className="px-3 py-2 text-right font-bold text-[var(--pm-green)]">{formatMoney(p.currentMarketValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageCount={pageCount} makeHref={(p) => qs({ page: String(p) })} />
    </Section>
  );
}
