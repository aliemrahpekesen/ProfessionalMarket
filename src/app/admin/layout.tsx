import Link from "next/link";
import { getAdminEmail } from "@/lib/adminSession";
import { logoutAction } from "./actions";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/professionals", label: "Professionals" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/transfers", label: "Transfers" },
  { href: "/admin/market-values", label: "Market values" },
  { href: "/admin/rumors", label: "Rumors" },
  { href: "/admin/news", label: "News" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await getAdminEmail();
  // Login page renders inside this layout without a session.
  if (!email) return <>{children}</>;

  return (
    <div className="grid gap-6 md:grid-cols-[180px_1fr]">
      <aside className="h-fit overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
        <div className="bg-[var(--pm-navy)] px-3 py-2 text-sm font-bold uppercase tracking-wide text-white">
          Back office
        </div>
        <nav className="flex flex-col p-2 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded px-2 py-1.5 font-semibold text-sky-800 hover:bg-gray-100">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-2">
          <p className="truncate px-2 text-xs text-gray-500" title={email}>{email}</p>
          <form action={logoutAction}>
            <button className="mt-1 w-full rounded px-2 py-1.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
