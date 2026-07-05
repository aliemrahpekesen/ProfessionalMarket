import { afterEach, describe, expect, it } from "vitest";
import {
  checkCredentials,
  createSessionToken,
  timingSafeEqualStr,
  verifySessionToken,
} from "@/lib/auth";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env.ADMIN_EMAIL = ORIGINAL_ENV.ADMIN_EMAIL;
  process.env.ADMIN_PASSWORD = ORIGINAL_ENV.ADMIN_PASSWORD;
  process.env.AUTH_SECRET = ORIGINAL_ENV.AUTH_SECRET;
});

describe("session tokens", () => {
  it("round-trips a valid session", async () => {
    const token = await createSessionToken("admin@example.com");
    expect(await verifySessionToken(token)).toBe("admin@example.com");
  });

  it("rejects expired tokens", async () => {
    const token = await createSessionToken("admin@example.com", new Date("2020-01-01T00:00:00Z"));
    expect(await verifySessionToken(token, new Date("2020-01-02T00:00:00Z"))).toBeNull();
  });

  it("rejects tampered payloads", async () => {
    const token = await createSessionToken("admin@example.com");
    const [, exp, sig] = token.split(".");
    const forgedEmail = Buffer.from("hacker@example.com").toString("base64url");
    expect(await verifySessionToken(`${forgedEmail}.${exp}.${sig}`)).toBeNull();
  });

  it("rejects tampered expiry", async () => {
    const token = await createSessionToken("admin@example.com");
    const [email, exp, sig] = token.split(".");
    expect(await verifySessionToken(`${email}.${Number(exp) + 10_000}.${sig}`)).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
    expect(await verifySessionToken("a.b")).toBeNull();
    expect(await verifySessionToken("a.b.c.d")).toBeNull();
  });

  it("rejects tokens signed with a different secret", async () => {
    process.env.AUTH_SECRET = "secret-one-secret-one-secret-one";
    const token = await createSessionToken("admin@example.com");
    process.env.AUTH_SECRET = "secret-two-secret-two-secret-two";
    expect(await verifySessionToken(token)).toBeNull();
  });
});

describe("timingSafeEqualStr", () => {
  it("compares equal and unequal strings", () => {
    expect(timingSafeEqualStr("abc", "abc")).toBe(true);
    expect(timingSafeEqualStr("abc", "abd")).toBe(false);
    expect(timingSafeEqualStr("abc", "ab")).toBe(false);
  });
});

describe("checkCredentials", () => {
  it("accepts only the configured admin credentials", () => {
    process.env.ADMIN_EMAIL = "boss@corp.com";
    process.env.ADMIN_PASSWORD = "super-secret";
    expect(checkCredentials("boss@corp.com", "super-secret")).toBe(true);
    expect(checkCredentials("boss@corp.com", "wrong")).toBe(false);
    expect(checkCredentials("other@corp.com", "super-secret")).toBe(false);
  });
});
