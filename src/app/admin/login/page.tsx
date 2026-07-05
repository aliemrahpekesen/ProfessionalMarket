import type { Metadata } from "next";
import { loginAction } from "../actions";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto mt-10 max-w-sm overflow-hidden rounded border border-gray-300 bg-white shadow-sm">
      <div className="bg-[var(--pm-navy)] px-4 py-3">
        <h1 className="text-sm font-bold uppercase tracking-wide text-white">Admin sign in</h1>
      </div>
      <form action={loginAction} className="space-y-4 p-4">
        {error ? (
          <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            Invalid email or password.
          </p>
        ) : null}
        <label className="block text-sm">
          <span className="font-semibold text-gray-700">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-gray-700">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <button className="w-full rounded bg-[var(--pm-navy)] px-4 py-2 font-semibold text-white hover:bg-[#02224f]">
          Sign in
        </button>
      </form>
    </div>
  );
}
