import Link from "next/link";
import { prisma } from "@/lib/db";
import { industrySpending } from "@/lib/queries";
import { formatMoney, formatDate } from "@/lib/format";
import { Section } from "@/components/Section";
import { Avatar } from "@/components/Avatar";
import { ProbabilityBar, RumorStatusBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [transfers, rumors, topValues, news, spending] = await Promise.all([
    prisma.transfer.findMany({
      orderBy: { transferDate: "desc" },
      take: 8,
      include: { professional: true, fromCompany: true, toCompany: true },
    }),
    prisma.rumor.findMany({
      where: { status: { in: ["HOT", "WARMING"] } },
      orderBy: { probability: "desc" },
      take: 6,
      include: { professional: true, targetCompany: true },
    }),
    prisma.professional.findMany({
      orderBy: { currentMarketValue: "desc" },
      take: 10,
      include: { currentCompany: true },
    }),
    prisma.newsItem.findMany({ orderBy: { publishedAt: "desc" }, take: 6 }),
    industrySpending(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Section title="Latest transfers" viewAllHref="/transfers">
          <table className="w-full text-sm">
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <Link href={`/professionals/${t.professional.slug}`} className="flex items-center gap-2 font-semibold text-sky-800 hover:underline">
                      <Avatar name={`${t.professional.firstName} ${t.professional.lastName}`} color={t.professional.headshotColor} size={28} />
                      {t.professional.firstName} {t.professional.lastName}
                    </Link>
                  </td>
                  <td className="hidden px-3 py-2 text-gray-600 sm:table-cell">
                    {t.fromCompany ? (
                      <Link href={`/companies/${t.fromCompany.slug}`} className="hover:underline">{t.fromCompany.name}</Link>
                    ) : ("Free agent")}
                    {" → "}
                    {t.toCompany ? (
                      <Link href={`/companies/${t.toCompany.slug}`} className="hover:underline">{t.toCompany.name}</Link>
                    ) : ("Free agent")}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-[var(--pm-green)]">{formatMoney(t.package)}</td>
                  <td className="hidden px-3 py-2 text-right text-xs text-gray-500 md:table-cell">{formatDate(t.transferDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Rumor mill" viewAllHref="/rumors">
          <table className="w-full text-sm">
            <tbody>
              {rumors.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <Link href={`/professionals/${r.professional.slug}`} className="font-semibold text-sky-800 hover:underline">
                      {r.professional.firstName} {r.professional.lastName}
                    </Link>
                    <span className="text-gray-500"> → </span>
                    <Link href={`/companies/${r.targetCompany.slug}`} className="text-sky-800 hover:underline">
                      {r.targetCompany.name}
                    </Link>
                  </td>
                  <td className="hidden px-3 py-2 sm:table-cell"><RumorStatusBadge status={r.status} /></td>
                  <td className="px-3 py-2"><ProbabilityBar value={r.probability} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Latest news" viewAllHref="/news">
          <ul className="divide-y divide-gray-100">
            {news.map((n) => (
              <li key={n.id} className="px-3 py-2 hover:bg-gray-50">
                <Link href={`/news/${n.slug}`} className="font-semibold text-sky-800 hover:underline">
                  {n.title}
                </Link>
                <div className="text-xs text-gray-500">{formatDate(n.publishedAt)}</div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Most valuable professionals" viewAllHref="/rankings">
          <ol className="divide-y divide-gray-100">
            {topValues.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                <span className="w-5 text-right text-xs font-bold text-gray-500">{i + 1}</span>
                <Avatar name={`${p.firstName} ${p.lastName}`} color={p.headshotColor} size={28} />
                <span className="min-w-0 flex-1">
                  <Link href={`/professionals/${p.slug}`} className="block truncate text-sm font-semibold text-sky-800 hover:underline">
                    {p.firstName} {p.lastName}
                  </Link>
                  <span className="block truncate text-xs text-gray-500">{p.currentCompany?.name ?? "Free agent"}</span>
                </span>
                <span className="text-sm font-bold text-[var(--pm-green)]">{formatMoney(p.currentMarketValue)}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Hiring spend by industry (365d)" viewAllHref="/industries">
          <ul className="divide-y divide-gray-100">
            {spending.map((s) => (
              <li key={s.industryId} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                <Link href={`/industries/${s.slug}`} className="text-sm font-semibold text-sky-800 hover:underline">
                  {s.name}
                </Link>
                <span className="text-sm font-bold text-[var(--pm-green)]">{formatMoney(s.spend)}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
