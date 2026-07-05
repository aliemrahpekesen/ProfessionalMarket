import type { Company, NewsItem, Professional } from "@prisma/client";
import { toInputDate } from "@/lib/format";
import { saveNewsAction } from "../actions";

const field = "mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm";
const label = "block text-sm font-semibold text-gray-700";

export function NewsForm({
  news,
  professionals,
  companies,
}: {
  news?: NewsItem;
  professionals: Professional[];
  companies: Company[];
}) {
  return (
    <form action={saveNewsAction} className="grid gap-4 p-4">
      {news ? <input type="hidden" name="id" value={news.id} /> : null}
      <label className={label}>
        Title *
        <input name="title" required defaultValue={news?.title} className={field} />
      </label>
      <label className={label}>
        Body *
        <textarea name="body" required rows={6} defaultValue={news?.body} className={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label}>
          Published at
          <input type="date" name="publishedAt" defaultValue={toInputDate(news?.publishedAt ?? new Date())} className={field} />
        </label>
        <label className={label}>
          Related professional
          <select name="professionalId" defaultValue={news?.professionalId ?? ""} className={field}>
            <option value="">None</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Related company
          <select name="companyId" defaultValue={news?.companyId ?? ""} className={field}>
            <option value="">None</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <button className="rounded bg-[var(--pm-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#02224f]">
          {news ? "Save changes" : "Publish news"}
        </button>
      </div>
    </form>
  );
}
