import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/queries";
import { formatMoney } from "@/lib/format";
import { Section } from "@/components/Section";
import { Pagination } from "@/components/Pagination";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteProfessionalAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — professionals" };

export default async function AdminProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim();
  const where = q
    ? { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }, { role: { contains: q } }] }
    : {};
  const [total, professionals] = await Promise.all([
    prisma.professional.count({ where }),
    prisma.professional.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { currentCompany: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Section title={`Professionals (${total})`}>
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-3">
        <form action="/admin/professionals" className="flex gap-2">
          <input type="search" name="q" defaultValue={q} placeholder="Search…" className="w-56 rounded border border-gray-300 px-2 py-1 text-sm" />
          <button className="rounded bg-gray-200 px-3 py-1 text-sm font-semibold">Search</button>
        </form>
        <Link href="/admin/professionals/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">
          + New professional
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Name</th>
            <th className="hidden px-3 py-2 sm:table-cell">Role</th>
            <th className="hidden px-3 py-2 md:table-cell">Company</th>
            <th className="px-3 py-2 text-right">Value</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {professionals.map((p) => (
            <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-semibold">
                <Link href={`/professionals/${p.slug}`} className="text-sky-800 hover:underline">
                  {p.firstName} {p.lastName}
                </Link>
              </td>
              <td className="hidden px-3 py-2 text-gray-600 sm:table-cell">{p.role}</td>
              <td className="hidden px-3 py-2 text-gray-600 md:table-cell">{p.currentCompany?.name ?? "Free agent"}</td>
              <td className="px-3 py-2 text-right font-semibold text-[var(--pm-green)]">{formatMoney(p.currentMarketValue)}</td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/professionals/${p.id}`} className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold">
                    Edit
                  </Link>
                  <form action={deleteProfessionalAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton
                      message={`Delete ${p.firstName} ${p.lastName}? This removes their whole history.`}
                      className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700"
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageCount={pageCount} makeHref={(p) => `/admin/professionals?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`} />
    </Section>
  );
}
