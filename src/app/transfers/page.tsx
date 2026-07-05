import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/format";
import { TRANSFER_TYPES, TRANSFER_TYPE_LABELS, isOneOf, type TransferType } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/Section";
import { Pagination } from "@/components/Pagination";
import { TransferTypeBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Latest transfers" };

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const type = sp.type && isOneOf(TRANSFER_TYPES, sp.type) ? sp.type : undefined;
  const where = type ? { type } : {};

  const [total, transfers] = await Promise.all([
    prisma.transfer.count({ where }),
    prisma.transfer.findMany({
      where,
      orderBy: { transferDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { professional: true, fromCompany: true, toCompany: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) =>
    `/transfers?${new URLSearchParams({ ...(type ? { type } : {}), page: String(p) })}`;

  return (
    <Section title={`Latest transfers (${total})`}>
      <nav className="flex flex-wrap gap-1 border-b border-gray-100 p-3 text-sm">
        <Link
          href="/transfers"
          className={`rounded px-2 py-1 font-semibold ${!type ? "bg-[var(--pm-navy)] text-white" : "text-sky-800 hover:bg-gray-100"}`}
        >
          All
        </Link>
        {TRANSFER_TYPES.map((tt) => (
          <Link
            key={tt}
            href={`/transfers?type=${tt}`}
            className={`rounded px-2 py-1 font-semibold ${type === tt ? "bg-[var(--pm-navy)] text-white" : "text-sky-800 hover:bg-gray-100"}`}
          >
            {TRANSFER_TYPE_LABELS[tt as TransferType]}
          </Link>
        ))}
      </nav>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Professional</th>
            <th className="hidden px-3 py-2 sm:table-cell">From</th>
            <th className="hidden px-3 py-2 sm:table-cell">To</th>
            <th className="hidden px-3 py-2 md:table-cell">Type</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2 text-right">Package</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2">
                <Link href={`/professionals/${t.professional.slug}`} className="flex items-center gap-2 font-semibold text-sky-800 hover:underline">
                  <Avatar name={`${t.professional.firstName} ${t.professional.lastName}`} color={t.professional.headshotColor} size={28} />
                  {t.professional.firstName} {t.professional.lastName}
                </Link>
              </td>
              <td className="hidden px-3 py-2 sm:table-cell">
                {t.fromCompany ? (
                  <Link href={`/companies/${t.fromCompany.slug}`} className="text-sky-800 hover:underline">{t.fromCompany.name}</Link>
                ) : ("Free agent")}
              </td>
              <td className="hidden px-3 py-2 sm:table-cell">
                {t.toCompany ? (
                  <Link href={`/companies/${t.toCompany.slug}`} className="text-sky-800 hover:underline">{t.toCompany.name}</Link>
                ) : ("Free agent")}
              </td>
              <td className="hidden px-3 py-2 md:table-cell"><TransferTypeBadge type={t.type} /></td>
              <td className="px-3 py-2 whitespace-nowrap text-gray-600">{formatDate(t.transferDate)}</td>
              <td className="px-3 py-2 text-right font-bold text-[var(--pm-green)]">{formatMoney(t.package)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageCount={pageCount} makeHref={qs} />
    </Section>
  );
}
