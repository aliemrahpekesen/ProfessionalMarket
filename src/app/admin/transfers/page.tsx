import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/format";
import { Section } from "@/components/Section";
import { Pagination } from "@/components/Pagination";
import { ConfirmButton } from "@/components/ConfirmButton";
import { TransferTypeBadge } from "@/components/Badges";
import { deleteTransferAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — transfers" };

export default async function AdminTransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const [total, transfers] = await Promise.all([
    prisma.transfer.count(),
    prisma.transfer.findMany({
      orderBy: { transferDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { professional: true, fromCompany: true, toCompany: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Section title={`Transfers (${total})`}>
      <div className="flex justify-end border-b border-gray-100 p-3">
        <Link href="/admin/transfers/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">
          + Record transfer
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Professional</th>
            <th className="hidden px-3 py-2 sm:table-cell">From → To</th>
            <th className="hidden px-3 py-2 md:table-cell">Type</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2 text-right">Package</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-semibold">{t.professional.firstName} {t.professional.lastName}</td>
              <td className="hidden px-3 py-2 text-gray-600 sm:table-cell">
                {t.fromCompany?.name ?? "Free agent"} → {t.toCompany?.name ?? "Free agent"}
              </td>
              <td className="hidden px-3 py-2 md:table-cell"><TransferTypeBadge type={t.type} /></td>
              <td className="px-3 py-2 whitespace-nowrap">{formatDate(t.transferDate)}</td>
              <td className="px-3 py-2 text-right font-semibold text-[var(--pm-green)]">{formatMoney(t.package)}</td>
              <td className="px-3 py-2 text-right">
                <form action={deleteTransferAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <ConfirmButton message="Delete this transfer record?" className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                    Delete
                  </ConfirmButton>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageCount={pageCount} makeHref={(p) => `/admin/transfers?page=${p}`} />
    </Section>
  );
}
