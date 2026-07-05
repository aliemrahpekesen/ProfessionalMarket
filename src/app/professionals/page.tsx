import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/queries";
import { calcAge, formatMoney } from "@/lib/format";
import { countryName } from "@/lib/constants";
import { Avatar } from "@/components/Avatar";
import { Section } from "@/components/Section";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Professionals directory" };

export default async function ProfessionalsPage({
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
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { currentCompany: true },
    }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Section title={`Professionals (${total})`}>
      <form className="flex gap-2 border-b border-gray-100 p-3" action="/professionals">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Filter by name or role…"
          className="w-64 rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <button className="rounded bg-[var(--pm-navy)] px-3 py-1 text-sm font-semibold text-white">Filter</button>
      </form>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Name</th>
            <th className="hidden px-3 py-2 sm:table-cell">Role</th>
            <th className="hidden px-3 py-2 md:table-cell">Age</th>
            <th className="hidden px-3 py-2 md:table-cell">Nationality</th>
            <th className="px-3 py-2">Company</th>
            <th className="px-3 py-2 text-right">Market value</th>
          </tr>
        </thead>
        <tbody>
          {professionals.map((p) => (
            <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2">
                <Link href={`/professionals/${p.slug}`} className="flex items-center gap-2 font-semibold text-sky-800 hover:underline">
                  <Avatar name={`${p.firstName} ${p.lastName}`} color={p.headshotColor} size={28} />
                  {p.firstName} {p.lastName}
                </Link>
              </td>
              <td className="hidden px-3 py-2 text-gray-600 sm:table-cell">{p.role}</td>
              <td className="hidden px-3 py-2 md:table-cell">{calcAge(p.birthDate)}</td>
              <td className="hidden px-3 py-2 md:table-cell">{countryName(p.nationality)}</td>
              <td className="px-3 py-2">
                {p.currentCompany ? (
                  <Link href={`/companies/${p.currentCompany.slug}`} className="text-sky-800 hover:underline">
                    {p.currentCompany.name}
                  </Link>
                ) : ("Free agent")}
              </td>
              <td className="px-3 py-2 text-right font-bold text-[var(--pm-green)]">{formatMoney(p.currentMarketValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageCount={pageCount} makeHref={(p) => `/professionals?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`} />
    </Section>
  );
}
