import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatMoney, toInputDate } from "@/lib/format";
import { Section } from "@/components/Section";
import { addMarketValueAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — add market value" };

const field = "mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm";
const label = "block text-sm font-semibold text-gray-700";

export default async function NewMarketValuePage() {
  const professionals = await prisma.professional.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <Section title="Add market value record">
      <form action={addMarketValueAction} className="grid gap-4 p-4 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>
          Professional *
          <select name="professionalId" required className={field}>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} — current {formatMoney(p.currentMarketValue)}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Value (USD/year) *
          <input type="number" name="value" required min={0} step={1000} className={field} placeholder="185000" />
        </label>
        <label className={label}>
          Date *
          <input type="date" name="recordedAt" required defaultValue={toInputDate(new Date())} className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Note
          <input name="note" className={field} placeholder="e.g. Promotion review" />
        </label>
        <div className="sm:col-span-2">
          <button className="rounded bg-[var(--pm-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#02224f]">
            Add record
          </button>
          <p className="mt-2 text-xs text-gray-500">The newest record always defines the professional&apos;s current market value.</p>
        </div>
      </form>
    </Section>
  );
}
