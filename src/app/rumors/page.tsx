import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { RUMOR_STATUSES, RUMOR_STATUS_LABELS, isOneOf, type RumorStatus } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/Section";
import { ProbabilityBar, RumorStatusBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Rumor mill" };

export default async function RumorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status && isOneOf(RUMOR_STATUSES, sp.status) ? sp.status : undefined;

  const rumors = await prisma.rumor.findMany({
    where: status ? { status } : {},
    orderBy: [{ probability: "desc" }, { updatedAt: "desc" }],
    include: { professional: { include: { currentCompany: true } }, targetCompany: true },
  });

  return (
    <Section title={`Rumor mill (${rumors.length})`}>
      <nav className="flex flex-wrap gap-1 border-b border-gray-100 p-3 text-sm">
        <Link
          href="/rumors"
          className={`rounded px-2 py-1 font-semibold ${!status ? "bg-[var(--pm-navy)] text-white" : "text-sky-800 hover:bg-gray-100"}`}
        >
          All
        </Link>
        {RUMOR_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/rumors?status=${s}`}
            className={`rounded px-2 py-1 font-semibold ${status === s ? "bg-[var(--pm-navy)] text-white" : "text-sky-800 hover:bg-gray-100"}`}
          >
            {RUMOR_STATUS_LABELS[s as RumorStatus]}
          </Link>
        ))}
      </nav>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Professional</th>
            <th className="hidden px-3 py-2 sm:table-cell">Current</th>
            <th className="px-3 py-2">Linked with</th>
            <th className="hidden px-3 py-2 text-right md:table-cell">Market value</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Probability</th>
            <th className="hidden px-3 py-2 lg:table-cell">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rumors.map((r) => {
            const done = r.status === "CONFIRMED" || r.status === "DENIED";
            return (
              <tr key={r.id} className={`border-t border-gray-100 hover:bg-gray-50 ${done ? "opacity-60" : ""}`}>
                <td className="px-3 py-2">
                  <Link href={`/professionals/${r.professional.slug}`} className="flex items-center gap-2 font-semibold text-sky-800 hover:underline">
                    <Avatar name={`${r.professional.firstName} ${r.professional.lastName}`} color={r.professional.headshotColor} size={28} />
                    {r.professional.firstName} {r.professional.lastName}
                  </Link>
                </td>
                <td className="hidden px-3 py-2 text-gray-600 sm:table-cell">
                  {r.professional.currentCompany?.name ?? "Free agent"}
                </td>
                <td className="px-3 py-2">
                  <Link href={`/companies/${r.targetCompany.slug}`} className="font-semibold text-sky-800 hover:underline">
                    {r.targetCompany.name}
                  </Link>
                </td>
                <td className="hidden px-3 py-2 text-right font-semibold text-[var(--pm-green)] md:table-cell">
                  {formatMoney(r.professional.currentMarketValue)}
                </td>
                <td className="px-3 py-2"><RumorStatusBadge status={r.status} /></td>
                <td className="px-3 py-2"><ProbabilityBar value={r.probability} /></td>
                <td className="hidden px-3 py-2 text-gray-500 lg:table-cell">{formatDate(r.updatedAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}
