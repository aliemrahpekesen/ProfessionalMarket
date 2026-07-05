import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { TRANSFER_TYPES, TRANSFER_TYPE_LABELS } from "@/lib/constants";
import { toInputDate } from "@/lib/format";
import { Section } from "@/components/Section";
import { createTransferAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — record transfer" };

const field = "mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm";
const label = "block text-sm font-semibold text-gray-700";

export default async function NewTransferPage() {
  const [professionals, companies] = await Promise.all([
    prisma.professional.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }], include: { currentCompany: true } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <Section title="Record transfer">
      <form action={createTransferAction} className="grid gap-4 p-4 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>
          Professional *
          <select name="professionalId" required className={field}>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} — {p.currentCompany?.name ?? "Free agent"}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          From company (empty = free agent)
          <select name="fromCompanyId" className={field}>
            <option value="">Free agent</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          To company (empty = leaves to free agency)
          <select name="toCompanyId" className={field}>
            <option value="">Free agency</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Date *
          <input type="date" name="transferDate" required defaultValue={toInputDate(new Date())} className={field} />
        </label>
        <label className={label}>
          Type *
          <select name="type" className={field}>
            {TRANSFER_TYPES.map((t) => (
              <option key={t} value={t}>{TRANSFER_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Package (USD/year)
          <input type="number" name="package" min={0} step={1000} className={field} placeholder="180000" />
        </label>
        <label className={label}>
          New role/title (optional)
          <input name="roleAfter" className={field} placeholder="e.g. VP Engineering" />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Note
          <input name="note" className={field} />
        </label>
        <div className="sm:col-span-2">
          <button className="rounded bg-[var(--pm-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#02224f]">
            Record transfer
          </button>
          <p className="mt-2 text-xs text-gray-500">
            If this is the professional&apos;s most recent move, their current company and role update automatically.
          </p>
        </div>
      </form>
    </Section>
  );
}
