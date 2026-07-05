import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { TIER_LABELS, countryName, type CompanyTier } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const i = await prisma.industry.findUnique({ where: { slug }, select: { name: true } });
  return { title: i ? `${i.name} industry` : "Industry not found" };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = await prisma.industry.findUnique({
    where: { slug },
    include: { companies: { include: { roster: { select: { currentMarketValue: true } } } } },
  });
  if (!industry) notFound();

  const rows = industry.companies
    .map((c) => ({
      ...c,
      rosterValue: c.roster.reduce((s, p) => s + p.currentMarketValue, 0),
      rosterSize: c.roster.length,
    }))
    .sort((a, b) => b.rosterValue - a.rosterValue);
  const totalValue = rows.reduce((s, c) => s + c.rosterValue, 0);

  return (
    <div className="space-y-6">
      <div className="rounded border border-gray-300 bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-black text-[var(--pm-navy)]">{industry.name}</h1>
        <p className="text-sm text-gray-600">{industry.description}</p>
        <p className="mt-2 text-sm">
          {rows.length} companies · total roster value{" "}
          <span className="font-bold text-[var(--pm-green)]">{formatMoney(totalValue)}</span>
        </p>
      </div>
      <Section title="Companies by roster value">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-500">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Company</th>
              <th className="hidden px-3 py-2 sm:table-cell">Tier</th>
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
                <td className="hidden px-3 py-2 text-gray-600 sm:table-cell">{TIER_LABELS[c.tier as CompanyTier] ?? c.tier}</td>
                <td className="hidden px-3 py-2 text-gray-600 md:table-cell">{c.hqCity}, {countryName(c.hqCountry)}</td>
                <td className="px-3 py-2 text-right">{c.rosterSize}</td>
                <td className="px-3 py-2 text-right font-bold text-[var(--pm-green)]">{formatMoney(c.rosterValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
