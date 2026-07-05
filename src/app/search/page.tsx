import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  if (query.length < 2) {
    return (
      <Section title="Search">
        <p className="p-4 text-sm text-gray-600">Type at least 2 characters to search professionals and companies.</p>
      </Section>
    );
  }

  const [professionals, companies] = await Promise.all([
    prisma.professional.findMany({
      where: {
        OR: [{ firstName: { contains: query } }, { lastName: { contains: query } }, { role: { contains: query } }],
      },
      take: 25,
      orderBy: { currentMarketValue: "desc" },
      include: { currentCompany: true },
    }),
    prisma.company.findMany({
      where: { name: { contains: query } },
      take: 15,
      include: { industry: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Section title={`Professionals matching “${query}” (${professionals.length})`}>
        {professionals.length === 0 ? (
          <p className="p-4 text-sm text-gray-600">No professionals found.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {professionals.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
                <Avatar name={`${p.firstName} ${p.lastName}`} color={p.headshotColor} size={32} />
                <span className="min-w-0 flex-1">
                  <Link href={`/professionals/${p.slug}`} className="font-semibold text-sky-800 hover:underline">
                    {p.firstName} {p.lastName}
                  </Link>
                  <span className="block truncate text-xs text-gray-500">
                    {p.role} · {p.currentCompany?.name ?? "Free agent"}
                  </span>
                </span>
                <span className="font-bold text-[var(--pm-green)]">{formatMoney(p.currentMarketValue)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section title={`Companies matching “${query}” (${companies.length})`}>
        {companies.length === 0 ? (
          <p className="p-4 text-sm text-gray-600">No companies found.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {companies.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
                <Avatar name={c.name} color={c.logoColor} size={32} square />
                <span className="min-w-0 flex-1">
                  <Link href={`/companies/${c.slug}`} className="font-semibold text-sky-800 hover:underline">
                    {c.name}
                  </Link>
                  <span className="block text-xs text-gray-500">{c.industry.name}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
