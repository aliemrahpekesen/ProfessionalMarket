import type { ReactNode } from "react";
import Link from "next/link";

/** Transfermarkt-style content box: dark title bar + white body. */
export function Section({
  title,
  children,
  viewAllHref,
  className = "",
}: {
  title: string;
  children: ReactNode;
  viewAllHref?: string;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded border border-gray-300 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between bg-[var(--pm-navy)] px-3 py-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">{title}</h2>
        {viewAllHref ? (
          <Link href={viewAllHref} className="text-xs text-sky-300 hover:text-white">
            View all »
          </Link>
        ) : null}
      </div>
      <div>{children}</div>
    </section>
  );
}
