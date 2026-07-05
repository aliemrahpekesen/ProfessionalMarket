import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

const TEST_DB_URL = `file:${resolve(__dirname, "../prisma/test.db")}`;

export function createTestClient(): PrismaClient {
  return new PrismaClient({ datasourceUrl: TEST_DB_URL });
}
