import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { calcAge, formatDate, formatMoney } from "@/lib/format";
import { TIER_LABELS, countryName, type CompanyTier } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/Section";
import { ProbabilityBar, RumorStatusBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await prisma.company.findUnique({ where: { slug }, select: { name: true } });
  return { title: c ? `${c.name} — roster & transfers` : "Company not found" };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      industry: true,
      roster: { orderBy: { currentMarketValue: "desc" } },
      transfersIn: {
        where: { transferDate: { gte: oneYearAgo } },
        orderBy: { transferDate: "desc" },
        include: { professional: true, fromCompany: true },
      },
      transfersOut: {
        where: { transferDate: { gte: oneYearAgo } },
        orderBy: { transferDate: "desc" },
        include: { professional: true, toCompany: true },
      },
      rumorsTargeting: {
        where: { status: { in: ["HOT", "WARMING", "COLD"] } },
        orderBy: { probability: "desc" },
        include: { professional: true },
      },
    },
  });
  if (!company) notFound();

  const rosterValue = company.roster.reduce((sum, p) => sum + p.currentMarketValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded border border-gray-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <Avatar name={company.name} color={company.logoColor} size={80} square />
        <div className="flex-1">
          <h1 className="text-2xl font-black text-[var(--pm-navy)]">{company.name}</h1>
          <p className="text-sm text-gray-600">
            <Link href={`/industries/${company.industry.slug}`} className="text-sky-800 hover:underline">
              {company.industry.name}
            </Link>{" "}
            · {TIER_LABELS[company.tier as CompanyTier] ?? company.tier} · {company.hqCity}, {countryName(company.hqCountry)}
            {company.foundedYear ? ` · founded ${company.foundedYear}` : ""}
            {company.employeeCount ? ` · ~${company.employeeCount.toLocaleString("en-US")} employees` : ""}
          </p>
        </div>
        <div className="rounded bg-emerald-50 p-4 text-right">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total roster value</div>
          <div className="text-2xl font-black text-[var(--pm-green)]">{formatMoney(rosterValue)}</div>
          <div className="text-xs text-gray-500">{company.roster.length} professionals</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title={`Roster (${company.roster.length})`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="hidden px-3 py-2 sm:table-cell">Role</th>
                  <th className="hidden px-3 py-2 md:table-cell">Age</th>
                  <th className="px-3 py-2 text-right">Market value</th>
                </tr>
              </thead>
              <tbody>
                {company.roster.map((p, i) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs font-bold text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link href={`/professionals/${p.slug}`} className="flex items-center gap-2 font-semibold text-sky-800 hover:underline">
                        <Avatar name={`${p.firstName} ${p.lastName}`} color={p.headshotColor} size={28} />
                        {p.firstName} {p.lastName}
                      </Link>
                    </td>
                    <td className="hidden px-3 py-2 text-gray-600 sm:table-cell">{p.role}</td>
                    <td className="hidden px-3 py-2 md:table-cell">{calcAge(p.birthDate)}</td>
                    <td className="px-3 py-2 text-right font-bold text-[var(--pm-green)]">{formatMoney(p.currentMarketValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Arrivals (365d)">
            <ul className="divide-y divide-gray-100">
              {company.transfersIn.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500">No arrivals in the last year.</li>
              ) : (
                company.transfersIn.map((t) => (
                  <li key={t.id} className="px-3 py-2 text-sm">
                    <Link href={`/professionals/${t.professional.slug}`} className="font-semibold text-sky-800 hover:underline">
                      {t.professional.firstName} {t.professional.lastName}
                    </Link>
                    <div className="text-xs text-gray-500">
                      from {t.fromCompany?.name ?? "free agency"} · {formatDate(t.transferDate)} ·{" "}
                      <span className="font-semibold text-[var(--pm-green)]">{formatMoney(t.package)}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Section>

          <Section title="Departures (365d)">
            <ul className="divide-y divide-gray-100">
              {company.transfersOut.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-500">No departures in the last year.</li>
              ) : (
                company.transfersOut.map((t) => (
                  <li key={t.id} className="px-3 py-2 text-sm">
                    <Link href={`/professionals/${t.professional.slug}`} className="font-semibold text-sky-800 hover:underline">
                      {t.professional.firstName} {t.professional.lastName}
                    </Link>
                    <div className="text-xs text-gray-500">
                      to {t.toCompany?.name ?? "free agency"} · {formatDate(t.transferDate)}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Section>

          {company.rumorsTargeting.length ? (
            <Section title="Linked with (rumors)">
              <ul className="divide-y divide-gray-100">
                {company.rumorsTargeting.map((r) => (
                  <li key={r.id} className="space-y-1 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/professionals/${r.professional.slug}`} className="font-semibold text-sky-800 hover:underline">
                        {r.professional.firstName} {r.professional.lastName}
                      </Link>
                      <RumorStatusBadge status={r.status} />
                    </div>
                    <ProbabilityBar value={r.probability} />
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
