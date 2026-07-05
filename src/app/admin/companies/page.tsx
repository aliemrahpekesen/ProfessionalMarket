import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Section } from "@/components/Section";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteCompanyAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — companies" };

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const companies = await prisma.company.findMany({
    where: q ? { name: { contains: q } } : {},
    orderBy: { name: "asc" },
    include: { industry: true, _count: { select: { roster: true } } },
  });

  return (
    <Section title={`Companies (${companies.length})`}>
      {sp.error === "roster" ? (
        <p className="border-b border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Cannot delete a company with a non-empty roster. Transfer its professionals first.
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-3">
        <form action="/admin/companies" className="flex gap-2">
          <input type="search" name="q" defaultValue={q} placeholder="Search…" className="w-56 rounded border border-gray-300 px-2 py-1 text-sm" />
          <button className="rounded bg-gray-200 px-3 py-1 text-sm font-semibold">Search</button>
        </form>
        <Link href="/admin/companies/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">
          + New company
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Name</th>
            <th className="hidden px-3 py-2 sm:table-cell">Industry</th>
            <th className="px-3 py-2 text-right">Roster</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-semibold">
                <Link href={`/companies/${c.slug}`} className="text-sky-800 hover:underline">{c.name}</Link>
              </td>
              <td className="hidden px-3 py-2 text-gray-600 sm:table-cell">{c.industry.name}</td>
              <td className="px-3 py-2 text-right">{c._count.roster}</td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/companies/${c.id}`} className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold">Edit</Link>
                  <form action={deleteCompanyAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton
                      message={`Delete ${c.name}?`}
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
    </Section>
  );
}
