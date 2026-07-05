import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * On serverless hosts (Vercel) the deployment bundle is read-only, so SQLite
 * writes would fail. For the demo we copy the committed seed snapshot
 * (prisma/demo.db) to /tmp on cold start — writable, but ephemeral per
 * instance. Production should use PostgreSQL (docs/OPERATIONS.md).
 */
function serverlessDatasourceUrl(): string | undefined {
  if (!process.env.VERCEL) return undefined; // local/self-hosted: use DATABASE_URL
  const tmpDb = "/tmp/professionalmarket.db";
  if (!existsSync(tmpDb)) {
    copyFileSync(join(process.cwd(), "prisma", "demo.db"), tmpDb);
  }
  return `file:${tmpDb}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: serverlessDatasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
