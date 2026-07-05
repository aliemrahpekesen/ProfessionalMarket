import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { RUMOR_STATUSES, RUMOR_STATUS_LABELS } from "@/lib/constants";
import { Section } from "@/components/Section";
import { saveRumorAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — new rumor" };

const field = "mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm";
const label = "block text-sm font-semibold text-gray-700";

export default async function NewRumorPage() {
  const [professionals, companies] = await Promise.all([
    prisma.professional.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }], include: { currentCompany: true } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <Section title="New rumor">
      <form action={saveRumorAction} className="grid gap-4 p-4 sm:grid-cols-2">
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
          Target company *
          <select name="targetCompanyId" required className={field}>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Status *
          <select name="status" defaultValue="WARMING" className={field}>
            {RUMOR_STATUSES.filter((s) => s !== "CONFIRMED" && s !== "DENIED").map((s) => (
              <option key={s} value={s}>{RUMOR_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Probability (0-100) *
          <input type="number" name="probability" required min={0} max={100} defaultValue={50} className={field} />
        </label>
        <label className={label}>
          Source
          <input name="source" className={field} placeholder="e.g. Industry insider" />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Note
          <input name="note" className={field} />
        </label>
        <div className="sm:col-span-2">
          <button className="rounded bg-[var(--pm-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#02224f]">
            Create rumor
          </button>
        </div>
      </form>
    </Section>
  );
}
