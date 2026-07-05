// Creates a fresh, isolated SQLite test database before the test run.

import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

export const TEST_DB_PATH = resolve(__dirname, "../prisma/test.db");
export const TEST_DB_URL = `file:${TEST_DB_PATH}`;

export default function setup() {
  rmSync(TEST_DB_PATH, { force: true });
  execSync("npx prisma db push --skip-generate", {
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: "pipe",
  });
}
