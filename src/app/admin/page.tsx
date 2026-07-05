import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboard() {
  const [professionals, companies, industries, transfers, rumors, news, marketCap, recentTransfers, hotRumors] =
    await Promise.all([
      prisma.professional.count(),
      prisma.company.count(),
      prisma.industry.count(),
      prisma.transfer.count(),
      prisma.rumor.count(),
      prisma.newsItem.count(),
      prisma.professional.aggregate({ _sum: { currentMarketValue: true } }),
      prisma.transfer.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { professional: true, toCompany: true },
      }),
      prisma.rumor.findMany({
        where: { status: { in: ["HOT", "WARMING"] } },
        orderBy: { probability: "desc" },
        take: 5,
        include: { professional: true, targetCompany: true },
      }),
    ]);

  const kpis = [
    { label: "Professionals", value: professionals, href: "/admin/professionals" },
    { label: "Companies", value: companies, href: "/admin/companies" },
    { label: "Industries", value: industries, href: "/admin" },
    { label: "Transfers", value: transfers, href: "/admin/transfers" },
    { label: "Rumors", value: rumors, href: "/admin/rumors" },
    { label: "News", value: news, href: "/admin/news" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="rounded border border-gray-300 bg-white p-3 text-center shadow-sm hover:bg-gray-50">
            <div className="text-2xl font-black text-[var(--pm-navy)]">{k.value}</div>
            <div className="text-xs font-semibold uppercase text-gray-500">{k.label}</div>
          </Link>
        ))}
      </div>

      <div className="rounded border border-gray-300 bg-white p-4 shadow-sm">
        <span className="text-xs font-semibold uppercase text-gray-500">Total market cap (all professionals)</span>
        <div className="text-3xl font-black text-[var(--pm-green)]">
          {formatMoney(marketCap._sum.currentMarketValue ?? 0)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/professionals/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">+ Professional</Link>
        <Link href="/admin/companies/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">+ Company</Link>
        <Link href="/admin/transfers/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">+ Transfer</Link>
        <Link href="/admin/market-values/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">+ Market value</Link>
        <Link href="/admin/rumors/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">+ Rumor</Link>
        <Link href="/admin/news/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">+ News</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Recently recorded transfers" viewAllHref="/admin/transfers">
          <ul className="divide-y divide-gray-100 text-sm">
            {recentTransfers.map((t) => (
              <li key={t.id} className="px-3 py-2">
                <span className="font-semibold">{t.professional.firstName} {t.professional.lastName}</span>
                {" → "}{t.toCompany?.name ?? "Free agency"} · {formatDate(t.transferDate)} ·{" "}
                <span className="font-semibold text-[var(--pm-green)]">{formatMoney(t.package)}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Hot rumors" viewAllHref="/admin/rumors">
          <ul className="divide-y divide-gray-100 text-sm">
            {hotRumors.map((r) => (
              <li key={r.id} className="px-3 py-2">
                <span className="font-semibold">{r.professional.firstName} {r.professional.lastName}</span>
                {" → "}{r.targetCompany.name} · {r.probability}%
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
