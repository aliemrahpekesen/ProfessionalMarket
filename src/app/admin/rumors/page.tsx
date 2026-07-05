import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Section } from "@/components/Section";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ProbabilityBar, RumorStatusBadge } from "@/components/Badges";
import { confirmRumorAction, denyRumorAction, deleteRumorAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — rumors" };

export default async function AdminRumorsPage() {
  const rumors = await prisma.rumor.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { professional: { include: { currentCompany: true } }, targetCompany: true },
  });

  return (
    <Section title={`Rumors (${rumors.length})`}>
      <div className="flex justify-end border-b border-gray-100 p-3">
        <Link href="/admin/rumors/new" className="rounded bg-[var(--pm-navy)] px-3 py-1.5 text-sm font-semibold text-white">
          + New rumor
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-3 py-2">Professional</th>
            <th className="hidden px-3 py-2 sm:table-cell">Target</th>
            <th className="px-3 py-2">Status</th>
            <th className="hidden px-3 py-2 md:table-cell">Probability</th>
            <th className="hidden px-3 py-2 lg:table-cell">Updated</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rumors.map((r) => {
            const open = r.status !== "CONFIRMED" && r.status !== "DENIED";
            return (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">
                  <span className="font-semibold">{r.professional.firstName} {r.professional.lastName}</span>
                  <span className="block text-xs text-gray-500">{r.professional.currentCompany?.name ?? "Free agent"}</span>
                </td>
                <td className="hidden px-3 py-2 sm:table-cell">{r.targetCompany.name}</td>
                <td className="px-3 py-2"><RumorStatusBadge status={r.status} /></td>
                <td className="hidden px-3 py-2 md:table-cell"><ProbabilityBar value={r.probability} /></td>
                <td className="hidden px-3 py-2 text-gray-500 lg:table-cell">{formatDate(r.updatedAt)}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap justify-end gap-1">
                    {open ? (
                      <>
                        <form action={confirmRumorAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <ConfirmButton
                            message={`Confirm this rumor? A HIRE transfer to ${r.targetCompany.name} will be created.`}
                            className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800"
                          >
                            Confirm
                          </ConfirmButton>
                        </form>
                        <form action={denyRumorAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Deny</button>
                        </form>
                      </>
                    ) : null}
                    <form action={deleteRumorAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <ConfirmButton message="Delete this rumor?" className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}
