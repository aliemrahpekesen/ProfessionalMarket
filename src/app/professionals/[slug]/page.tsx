import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { calcAge, formatDate, formatMoney } from "@/lib/format";
import {
  countryName,
  ROLE_GROUP_LABELS,
  SENIORITY_LABELS,
  type RoleGroup,
  type Seniority,
} from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/Section";
import { MarketValueChart } from "@/components/MarketValueChart";
import { ProbabilityBar, RumorStatusBadge, TransferTypeBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";

async function getProfessional(slug: string) {
  return prisma.professional.findUnique({
    where: { slug },
    include: {
      currentCompany: { include: { industry: true } },
      agency: true,
      marketValues: { orderBy: { recordedAt: "asc" } },
      transfers: {
        orderBy: { transferDate: "desc" },
        include: { fromCompany: true, toCompany: true },
      },
      careerStats: { orderBy: { year: "desc" } },
      achievements: { orderBy: { year: "desc" } },
      rumors: {
        where: { status: { in: ["HOT", "WARMING", "COLD"] } },
        orderBy: { probability: "desc" },
        include: { targetCompany: true },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.professional.findUnique({ where: { slug }, select: { firstName: true, lastName: true, role: true } });
  if (!p) return { title: "Professional not found" };
  return {
    title: `${p.firstName} ${p.lastName} — ${p.role}`,
    description: `Market value, transfer history and rumors for ${p.firstName} ${p.lastName} (${p.role}).`,
  };
}

export default async function ProfessionalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProfessional(slug);
  if (!p) notFound();

  const skills = p.skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header info box */}
      <div className="overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row">
          <Avatar name={`${p.firstName} ${p.lastName}`} color={p.headshotColor} size={96} />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-[var(--pm-navy)]">
              {p.firstName} {p.lastName}
            </h1>
            <p className="text-sm font-semibold text-gray-600">
              {p.role} · {SENIORITY_LABELS[p.seniority as Seniority] ?? p.seniority} ·{" "}
              {ROLE_GROUP_LABELS[p.roleGroup as RoleGroup] ?? p.roleGroup}
            </p>
            <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-gray-100 py-1">
                <dt className="text-gray-500">Date of birth / Age</dt>
                <dd className="font-semibold">{formatDate(p.birthDate)} ({calcAge(p.birthDate)})</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <dt className="text-gray-500">Nationality</dt>
                <dd className="font-semibold">{countryName(p.nationality)}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <dt className="text-gray-500">Current company</dt>
                <dd className="font-semibold">
                  {p.currentCompany ? (
                    <Link className="text-sky-800 hover:underline" href={`/companies/${p.currentCompany.slug}`}>
                      {p.currentCompany.name}
                    </Link>
                  ) : ("Free agent")}
                </dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <dt className="text-gray-500">Industry</dt>
                <dd className="font-semibold">
                  {p.currentCompany ? (
                    <Link className="text-sky-800 hover:underline" href={`/industries/${p.currentCompany.industry.slug}`}>
                      {p.currentCompany.industry.name}
                    </Link>
                  ) : ("—")}
                </dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <dt className="text-gray-500">Contract until</dt>
                <dd className="font-semibold">{p.contractUntil ? formatDate(p.contractUntil) : "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <dt className="text-gray-500">Agency</dt>
                <dd className="font-semibold">{p.agency?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <dt className="text-gray-500">Open to offers</dt>
                <dd className="font-semibold">{p.openToOffers ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <dt className="text-gray-500">City</dt>
                <dd className="font-semibold">{p.city || "—"}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col items-start justify-start rounded bg-emerald-50 p-4 sm:w-52 sm:items-end">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Market value</span>
            <span className="text-3xl font-black text-[var(--pm-green)]">{formatMoney(p.currentMarketValue)}</span>
            <span className="text-xs text-gray-500">per year</span>
          </div>
        </div>
        {p.bio ? <p className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">{p.bio}</p> : null}
        {skills.length ? (
          <div className="flex flex-wrap gap-1 border-t border-gray-100 px-4 py-3">
            {skills.map((s) => (
              <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{s}</span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Market value development">
            <MarketValueChart points={p.marketValues.map((mv) => ({ date: mv.recordedAt, value: mv.value }))} />
            <table className="w-full border-t border-gray-100 text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="hidden px-3 py-2 sm:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {[...p.marketValues].reverse().map((mv) => (
                  <tr key={mv.id} className="border-t border-gray-100">
                    <td className="px-3 py-1.5">{formatDate(mv.recordedAt)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold text-[var(--pm-green)]">{formatMoney(mv.value)}</td>
                    <td className="hidden px-3 py-1.5 text-gray-500 sm:table-cell">{mv.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title={`Transfer history (${p.transfers.length} moves)`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">From</th>
                  <th className="px-3 py-2">To</th>
                  <th className="hidden px-3 py-2 sm:table-cell">Type</th>
                  <th className="hidden px-3 py-2 text-right md:table-cell">MV at move</th>
                  <th className="px-3 py-2 text-right">Package</th>
                </tr>
              </thead>
              <tbody>
                {p.transfers.map((t) => (
                  <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">{formatDate(t.transferDate)}</td>
                    <td className="px-3 py-2">
                      {t.fromCompany ? (
                        <Link className="text-sky-800 hover:underline" href={`/companies/${t.fromCompany.slug}`}>{t.fromCompany.name}</Link>
                      ) : ("Free agent")}
                    </td>
                    <td className="px-3 py-2">
                      {t.toCompany ? (
                        <Link className="text-sky-800 hover:underline" href={`/companies/${t.toCompany.slug}`}>{t.toCompany.name}</Link>
                      ) : ("Free agent")}
                    </td>
                    <td className="hidden px-3 py-2 sm:table-cell"><TransferTypeBadge type={t.type} /></td>
                    <td className="hidden px-3 py-2 text-right text-gray-600 md:table-cell">{formatMoney(t.marketValueAtTransfer)}</td>
                    <td className="px-3 py-2 text-right font-bold text-[var(--pm-green)]">{formatMoney(t.package)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="space-y-6">
          {p.rumors.length ? (
            <Section title="Active rumors">
              <ul className="divide-y divide-gray-100">
                {p.rumors.map((r) => (
                  <li key={r.id} className="space-y-1 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <Link className="text-sm font-semibold text-sky-800 hover:underline" href={`/companies/${r.targetCompany.slug}`}>
                        → {r.targetCompany.name}
                      </Link>
                      <RumorStatusBadge status={r.status} />
                    </div>
                    <ProbabilityBar value={r.probability} />
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {p.achievements.length ? (
            <Section title="Achievements">
              <ul className="divide-y divide-gray-100">
                {p.achievements.map((a) => (
                  <li key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="font-semibold">🏆 {a.name}</span>
                    <span className="text-gray-500">{a.year}</span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {p.careerStats.length ? (
            <Section title="Career stats">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">Year</th>
                    <th className="px-3 py-2 text-right">Team</th>
                    <th className="px-3 py-2 text-right">Projects</th>
                    <th className="px-3 py-2 text-right">Talks</th>
                  </tr>
                </thead>
                <tbody>
                  {p.careerStats.map((s) => (
                    <tr key={s.id} className="border-t border-gray-100">
                      <td className="px-3 py-1.5 font-semibold">{s.year}</td>
                      <td className="px-3 py-1.5 text-right">{s.teamSize}</td>
                      <td className="px-3 py-1.5 text-right">{s.projectsDelivered}</td>
                      <td className="px-3 py-1.5 text-right">{s.talksGiven}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
