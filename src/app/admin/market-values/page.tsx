import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/format";
import { Section } from "@/components/Section";
import { Pagination } from "@/components/Pagination";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteMarketValueAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — market values" };

export default async function AdminMarketValuesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [total, records] = await Promise.all([
    prisma.marketValueRecord.count(),
    prisma.marketValueRecord.findMany({
      orderBy: { recordedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { professional: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Section title={`Market value records (${total})`}>
      <div className="flex justify-end border-b border-gray-100 p-3">
        <Link href="/admin/market-values/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">
          + Add market value
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Professional</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2 text-right">Value</th>
            <th className="hidden px-3 py-2 sm:table-cell">Note</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-semibold">{r.professional.firstName} {r.professional.lastName}</td>
              <td className="px-3 py-2 whitespace-nowrap">{formatDate(r.recordedAt)}</td>
              <td className="px-3 py-2 text-right font-semibold text-[var(--pm-green)]">{formatMoney(r.value)}</td>
              <td className="hidden px-3 py-2 text-gray-500 sm:table-cell">{r.note}</td>
              <td className="px-3 py-2 text-right">
                <form action={deleteMarketValueAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmButton message="Delete this market value record? The current value will be recomputed." className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                    Delete
                  </ConfirmButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageCount={pageCount} makeHref={(p) => `/admin/market-values?page=${p}`} />
    </Section>
  );
}
