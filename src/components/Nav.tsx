import Link from "next/link";
import { t } from "@/lib/i18n";

const LINKS = [
  { href: "/rankings", label: t("nav.rankings") },
  { href: "/transfers", label: t("nav.transfers") },
  { href: "/rumors", label: t("nav.rumors") },
  { href: "/professionals", label: t("nav.professionals") },
  { href: "/companies", label: t("nav.companies") },
  { href: "/industries", label: t("nav.industries") },
  { href: "/news", label: t("nav.news") },
];

export function Nav() {
  return (
    <header className="bg-[var(--pm-navy)] text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-black tracking-tight">
            Professional<span className="text-emerald-400">Market</span>
          </span>
          <span className="hidden text-xs text-gray-300 sm:inline">{t("app.tagline")}</span>
        </Link>
        <form action="/search" className="order-last flex w-full gap-0 sm:order-none sm:ml-auto sm:w-72">
          <input
            type="search"
            name="q"
            placeholder={t("search.placeholder")}
            className="w-full rounded-l border-0 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-2 focus:outline-emerald-400"
          />
          <button
            type="submit"
            className="rounded-r bg-emerald-600 px-3 py-1.5 text-sm font-semibold hover:bg-emerald-500"
          >
            {t("search.button")}
          </button>
        </form>
      </div>
      <nav className="border-t border-white/15 bg-[#02224f]">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-1 px-2 text-sm font-semibold">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="px-2 py-2 hover:bg-white/10">
              {l.label}
            </Link>
          ))}
          <Link href="/admin" className="ml-auto px-2 py-2 text-gray-300 hover:bg-white/10">
            {t("nav.admin")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
