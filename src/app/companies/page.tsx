import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { TIER_LABELS, countryName, type CompanyTier } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      industry: true,
      roster: { select: { currentMarketValue: true } },
    },
    orderBy: { name: "asc" },
  });
  const rows = companies
    .map((c) => ({
      ...c,
      rosterValue: c.roster.reduce((sum, p) => sum + p.currentMarketValue, 0),
      rosterSize: c.roster.length,
    }))
    .sort((a, b) => b.rosterValue - a.rosterValue);

  return (
    <Section title={`Companies (${companies.length})`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Company</th>
            <th className="hidden px-3 py-2 sm:table-cell">Industry</th>
            <th className="hidden px-3 py-2 md:table-cell">Tier</th>
            <th className="hidden px-3 py-2 md:table-cell">HQ</th>
            <th className="px-3 py-2 text-right">Roster</th>
            <th className="px-3 py-2 text-right">Roster value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c, i) => (
            <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 text-xs font-bold text-gray-500">{i + 1}</td>
              <td className="px-3 py-2">
                <Link href={`/companies/${c.slug}`} className="flex items-center gap-2 font-semibold text-sky-800 hover:underline">
                  <Avatar name={c.name} color={c.logoColor} size={28} square />
                  {c.name}
                </Link>
              </td>
              <td className="hidden px-3 py-2 sm:table-cell">
                <Link href={`/industries/${c.industry.slug}`} className="text-sky-800 hover:underline">{c.industry.name}</Link>
              </td>
              <td className="hidden px-3 py-2 text-gray-600 md:table-cell">{TIER_LABELS[c.tier as CompanyTier] ?? c.tier}</td>
              <td className="hidden px-3 py-2 text-gray-600 md:table-cell">{c.hqCity}, {countryName(c.hqCountry)}</td>
              <td className="px-3 py-2 text-right">{c.rosterSize}</td>
              <td className="px-3 py-2 text-right font-bold text-[var(--pm-green)]">{formatMoney(c.rosterValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}
