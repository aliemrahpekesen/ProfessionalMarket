import Link from "next/link";

/** Query-param pagination. `makeHref` builds the URL for a given page. */
export function Pagination({
  page,
  pageCount,
  makeHref,
}: {
  page: number;
  pageCount: number;
  makeHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  const windowPages: number[] = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pageCount, page + 2); p += 1) windowPages.push(p);
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 p-3 text-sm">
      {page > 1 ? (
        <Link className="rounded border border-gray-300 bg-white px-2 py-1 hover:bg-gray-100" href={makeHref(page - 1)}>
          ‹ Prev
        </Link>
      ) : null}
      {windowPages[0] > 1 ? <span className="px-1 text-gray-500">…</span> : null}
      {windowPages.map((p) =>
        p === page ? (
          <span key={p} className="rounded bg-[var(--pm-navy)] px-2.5 py-1 font-bold text-white">
            {p}
          </span>
        ) : (
          <Link key={p} className="rounded border border-gray-300 bg-white px-2.5 py-1 hover:bg-gray-100" href={makeHref(p)}>
            {p}
          </Link>
        ),
      )}
      {windowPages[windowPages.length - 1] < pageCount ? <span className="px-1 text-gray-500">…</span> : null}
      {page < pageCount ? (
        <Link className="rounded border border-gray-300 bg-white px-2 py-1 hover:bg-gray-100" href={makeHref(page + 1)}>
          Next ›
        </Link>
      ) : null}
    </nav>
  );
}
