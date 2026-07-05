// Server-side session helpers (route handlers, server components, actions).

import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

export async function getAdminEmail(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Defense-in-depth: server actions call this even though middleware guards /admin. */
export async function requireAdmin(): Promise<string> {
  const email = await getAdminEmail();
  if (!email) throw new Error("Unauthorized");
  return email;
}
