import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { industrySpending } from "@/lib/queries";
import { formatMoney } from "@/lib/format";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Industries" };

export default async function IndustriesPage() {
  const [industries, spending] = await Promise.all([
    prisma.industry.findMany({
      orderBy: { name: "asc" },
      include: { companies: { include: { roster: { select: { currentMarketValue: true } } } } },
    }),
    industrySpending(),
  ]);
  const spendMap = new Map(spending.map((s) => [s.industryId, s.spend]));

  const rows = industries
    .map((i) => ({
      ...i,
      companyCount: i.companies.length,
      professionals: i.companies.reduce((n, c) => n + c.roster.length, 0),
      totalValue: i.companies.reduce((sum, c) => sum + c.roster.reduce((s, p) => s + p.currentMarketValue, 0), 0),
      spend: spendMap.get(i.id) ?? 0,
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  return (
    <Section title="Industries">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Industry</th>
            <th className="px-3 py-2 text-right">Companies</th>
            <th className="hidden px-3 py-2 text-right sm:table-cell">Professionals</th>
            <th className="px-3 py-2 text-right">Total roster value</th>
            <th className="hidden px-3 py-2 text-right md:table-cell">Hiring spend (365d)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2">
                <Link href={`/industries/${i.slug}`} className="font-semibold text-sky-800 hover:underline">{i.name}</Link>
                <div className="text-xs text-gray-500">{i.description}</div>
              </td>
              <td className="px-3 py-2 text-right">{i.companyCount}</td>
              <td className="hidden px-3 py-2 text-right sm:table-cell">{i.professionals}</td>
              <td className="px-3 py-2 text-right font-bold text-[var(--pm-green)]">{formatMoney(i.totalValue)}</td>
              <td className="hidden px-3 py-2 text-right md:table-cell">{formatMoney(i.spend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}
