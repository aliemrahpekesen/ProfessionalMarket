import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md rounded border border-gray-300 bg-white p-8 text-center shadow-sm">
      <h1 className="text-3xl font-black text-[var(--pm-navy)]">404</h1>
      <p className="mt-2 text-sm text-gray-600">This page has been transferred to an unknown destination.</p>
      <Link href="/" className="mt-4 inline-block rounded bg-[var(--pm-navy)] px-4 py-2 text-sm font-semibold text-white">
        Back to home
      </Link>
    </div>
  );
}
