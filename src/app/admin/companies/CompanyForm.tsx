import type { Company, Industry } from "@prisma/client";
import { COMPANY_TIERS, TIER_LABELS } from "@/lib/constants";
import { saveCompanyAction } from "../actions";

const field = "mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm";
const label = "block text-sm font-semibold text-gray-700";

export function CompanyForm({ company, industries }: { company?: Company; industries: Industry[] }) {
  return (
    <form action={saveCompanyAction} className="grid gap-4 p-4 sm:grid-cols-2">
      {company ? <input type="hidden" name="id" value={company.id} /> : null}
      <label className={label}>
        Name *
        <input name="name" required defaultValue={company?.name} className={field} />
      </label>
      <label className={label}>
        Industry *
        <select name="industryId" required defaultValue={company?.industryId ?? industries[0]?.id} className={field}>
          {industries.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        Tier *
        <select name="tier" defaultValue={company?.tier ?? "ENTERPRISE"} className={field}>
          {COMPANY_TIERS.map((t) => (
            <option key={t} value={t}>{TIER_LABELS[t]}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        Logo color
        <input type="color" name="logoColor" defaultValue={company?.logoColor ?? "#00193f"} className={`${field} h-9`} />
      </label>
      <label className={label}>
        HQ city
        <input name="hqCity" defaultValue={company?.hqCity} className={field} />
      </label>
      <label className={label}>
        HQ country (2-letter code)
        <input name="hqCountry" maxLength={2} defaultValue={company?.hqCountry} className={field} placeholder="US" />
      </label>
      <label className={label}>
        Founded year
        <input type="number" name="foundedYear" min={1600} max={2100} defaultValue={company?.foundedYear ?? ""} className={field} />
      </label>
      <label className={label}>
        Employee count
        <input type="number" name="employeeCount" min={1} defaultValue={company?.employeeCount ?? ""} className={field} />
      </label>
      <label className={`${label} sm:col-span-2`}>
        Website
        <input type="url" name="website" defaultValue={company?.website} className={field} placeholder="https://…" />
      </label>
      <div className="sm:col-span-2">
        <button className="rounded bg-[var(--pm-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#02224f]">
          {company ? "Save changes" : "Create company"}
        </button>
      </div>
    </form>
  );
}
