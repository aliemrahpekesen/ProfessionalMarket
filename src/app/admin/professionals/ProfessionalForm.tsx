import type { Agency, Company, Professional } from "@prisma/client";
import {
  ROLE_GROUPS,
  ROLE_GROUP_LABELS,
  SENIORITIES,
  SENIORITY_LABELS,
} from "@/lib/constants";
import { toInputDate } from "@/lib/format";
import { saveProfessionalAction } from "../actions";

const field = "mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm";
const label = "block text-sm font-semibold text-gray-700";

export function ProfessionalForm({
  professional,
  companies,
  agencies,
}: {
  professional?: Professional;
  companies: Company[];
  agencies: Agency[];
}) {
  return (
    <form action={saveProfessionalAction} className="grid gap-4 p-4 sm:grid-cols-2">
      {professional ? <input type="hidden" name="id" value={professional.id} /> : null}
      <label className={label}>
        First name *
        <input name="firstName" required defaultValue={professional?.firstName} className={field} />
      </label>
      <label className={label}>
        Last name *
        <input name="lastName" required defaultValue={professional?.lastName} className={field} />
      </label>
      <label className={label}>
        Role / title *
        <input name="role" required defaultValue={professional?.role} className={field} placeholder="e.g. Staff Backend Engineer" />
      </label>
      <label className={label}>
        Function *
        <select name="roleGroup" defaultValue={professional?.roleGroup ?? "ENGINEERING"} className={field}>
          {ROLE_GROUPS.map((g) => (
            <option key={g} value={g}>{ROLE_GROUP_LABELS[g]}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        Seniority *
        <select name="seniority" defaultValue={professional?.seniority ?? "SENIOR"} className={field}>
          {SENIORITIES.map((s) => (
            <option key={s} value={s}>{SENIORITY_LABELS[s]}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        Birth date *
        <input type="date" name="birthDate" required defaultValue={toInputDate(professional?.birthDate)} className={field} />
      </label>
      <label className={label}>
        Nationality (2-letter code) *
        <input name="nationality" required maxLength={2} defaultValue={professional?.nationality} className={field} placeholder="TR" />
      </label>
      <label className={label}>
        City
        <input name="city" defaultValue={professional?.city} className={field} />
      </label>
      <label className={label}>
        Current company
        <select name="currentCompanyId" defaultValue={professional?.currentCompanyId ?? ""} className={field}>
          <option value="">Free agent</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        Agency
        <select name="agencyId" defaultValue={professional?.agencyId ?? ""} className={field}>
          <option value="">None</option>
          {agencies.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        Contract until
        <input type="date" name="contractUntil" defaultValue={toInputDate(professional?.contractUntil)} className={field} />
      </label>
      {!professional ? (
        <label className={label}>
          Initial market value (USD/year)
          <input type="number" name="initialMarketValue" min={0} step={1000} className={field} placeholder="150000" />
        </label>
      ) : null}
      <label className={`${label} sm:col-span-2`}>
        Skills (comma-separated)
        <input name="skills" defaultValue={professional?.skills} className={field} placeholder="TypeScript,Kubernetes,AWS" />
      </label>
      <label className={`${label} sm:col-span-2`}>
        Bio
        <textarea name="bio" rows={3} defaultValue={professional?.bio} className={field} />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <input type="checkbox" name="openToOffers" defaultChecked={professional?.openToOffers} />
        Open to offers
      </label>
      <div className="sm:col-span-2">
        <button className="rounded bg-[var(--pm-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#02224f]">
          {professional ? "Save changes" : "Create professional"}
        </button>
      </div>
    </form>
  );
}
