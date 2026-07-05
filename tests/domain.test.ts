// Integration tests for the domain service layer against a real SQLite test DB.

import { afterAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createTestClient } from "./testDb";
import {
  addMarketValue,
  confirmRumor,
  createTransfer,
  denyRumor,
  recomputeCurrentCompany,
  recomputeCurrentMarketValue,
} from "@/lib/domain";

const db: PrismaClient = createTestClient();

async function reset() {
  await db.newsItem.deleteMany();
  await db.rumor.deleteMany();
  await db.achievement.deleteMany();
  await db.careerStat.deleteMany();
  await db.transfer.deleteMany();
  await db.marketValueRecord.deleteMany();
  await db.professional.deleteMany();
  await db.agency.deleteMany();
  await db.company.deleteMany();
  await db.industry.deleteMany();
}

async function fixture() {
  const industry = await db.industry.create({
    data: { name: "Technology", slug: "technology" },
  });
  const acme = await db.company.create({
    data: { name: "Acme", slug: "acme", industryId: industry.id },
  });
  const globex = await db.company.create({
    data: { name: "Globex", slug: "globex", industryId: industry.id },
  });
  const pro = await db.professional.create({
    data: {
      slug: "jane-doe",
      firstName: "Jane",
      lastName: "Doe",
      birthDate: new Date("1990-01-15T00:00:00Z"),
      nationality: "US",
      role: "Backend Engineer",
      roleGroup: "ENGINEERING",
      seniority: "SENIOR",
    },
  });
  return { industry, acme, globex, pro };
}

beforeEach(reset);
afterAll(async () => {
  await db.$disconnect();
});

describe("createTransfer", () => {
  it("updates current company and role for the newest transfer", async () => {
    const { acme, pro } = await fixture();
    await createTransfer(db, {
      professionalId: pro.id,
      toCompanyId: acme.id,
      transferDate: new Date("2026-01-01T00:00:00Z"),
      type: "HIRE",
      package: 150_000,
      roleAfter: "Staff Backend Engineer",
    });
    const updated = await db.professional.findUniqueOrThrow({ where: { id: pro.id } });
    expect(updated.currentCompanyId).toBe(acme.id);
    expect(updated.role).toBe("Staff Backend Engineer");
  });

  it("does NOT change current company when backfilling an older transfer", async () => {
    const { acme, globex, pro } = await fixture();
    await createTransfer(db, {
      professionalId: pro.id,
      toCompanyId: acme.id,
      transferDate: new Date("2026-01-01T00:00:00Z"),
      type: "HIRE",
    });
    // Backfilled historic move, older date:
    await createTransfer(db, {
      professionalId: pro.id,
      toCompanyId: globex.id,
      transferDate: new Date("2020-01-01T00:00:00Z"),
      type: "HIRE",
    });
    const updated = await db.professional.findUniqueOrThrow({ where: { id: pro.id } });
    expect(updated.currentCompanyId).toBe(acme.id);
  });

  it("supports moves to free agency (null company)", async () => {
    const { acme, pro } = await fixture();
    await createTransfer(db, {
      professionalId: pro.id,
      toCompanyId: acme.id,
      transferDate: new Date("2025-01-01T00:00:00Z"),
      type: "HIRE",
    });
    await createTransfer(db, {
      professionalId: pro.id,
      fromCompanyId: acme.id,
      toCompanyId: null,
      transferDate: new Date("2026-01-01T00:00:00Z"),
      type: "FREE_AGENT",
    });
    const updated = await db.professional.findUniqueOrThrow({ where: { id: pro.id } });
    expect(updated.currentCompanyId).toBeNull();
  });

  it("snapshots market value at transfer time", async () => {
    const { acme, pro } = await fixture();
    await addMarketValue(db, {
      professionalId: pro.id,
      value: 120_000,
      recordedAt: new Date("2025-06-01T00:00:00Z"),
    });
    const transfer = await createTransfer(db, {
      professionalId: pro.id,
      toCompanyId: acme.id,
      transferDate: new Date("2026-01-01T00:00:00Z"),
      type: "HIRE",
    });
    expect(transfer.marketValueAtTransfer).toBe(120_000);
  });

  it("rejects invalid types and negative packages", async () => {
    const { acme, pro } = await fixture();
    await expect(
      createTransfer(db, {
        professionalId: pro.id,
        toCompanyId: acme.id,
        transferDate: new Date(),
        type: "LOAN",
      }),
    ).rejects.toThrow(/Invalid transfer type/);
    await expect(
      createTransfer(db, {
        professionalId: pro.id,
        toCompanyId: acme.id,
        transferDate: new Date(),
        type: "HIRE",
        package: -5,
      }),
    ).rejects.toThrow(/Package/);
  });
});

describe("recomputeCurrentCompany (issue #39)", () => {
  it("falls back to the previous transfer after the newest is deleted", async () => {
    const { acme, globex, pro } = await fixture();
    await createTransfer(db, {
      professionalId: pro.id,
      toCompanyId: acme.id,
      transferDate: new Date("2025-01-01T00:00:00Z"),
      type: "HIRE",
      roleAfter: "Engineer at Acme",
    });
    const newest = await createTransfer(db, {
      professionalId: pro.id,
      fromCompanyId: acme.id,
      toCompanyId: globex.id,
      transferDate: new Date("2026-01-01T00:00:00Z"),
      type: "HIRE",
      roleAfter: "Engineer at Globex",
    });
    await db.transfer.delete({ where: { id: newest.id } });
    expect(await recomputeCurrentCompany(db, pro.id)).toBe(acme.id);
    const updated = await db.professional.findUniqueOrThrow({ where: { id: pro.id } });
    expect(updated.currentCompanyId).toBe(acme.id);
    expect(updated.role).toBe("Engineer at Acme");
  });

  it("clears the company when no transfers remain", async () => {
    const { acme, pro } = await fixture();
    const only = await createTransfer(db, {
      professionalId: pro.id,
      toCompanyId: acme.id,
      transferDate: new Date("2026-01-01T00:00:00Z"),
      type: "HIRE",
    });
    await db.transfer.delete({ where: { id: only.id } });
    expect(await recomputeCurrentCompany(db, pro.id)).toBeNull();
    const updated = await db.professional.findUniqueOrThrow({ where: { id: pro.id } });
    expect(updated.currentCompanyId).toBeNull();
  });
});

describe("addMarketValue / recompute", () => {
  it("newest record drives currentMarketValue", async () => {
    const { pro } = await fixture();
    await addMarketValue(db, { professionalId: pro.id, value: 100_000, recordedAt: new Date("2025-01-01T00:00:00Z") });
    await addMarketValue(db, { professionalId: pro.id, value: 140_000, recordedAt: new Date("2026-01-01T00:00:00Z") });
    // Backfilled older record must not win:
    await addMarketValue(db, { professionalId: pro.id, value: 90_000, recordedAt: new Date("2024-01-01T00:00:00Z") });
    const updated = await db.professional.findUniqueOrThrow({ where: { id: pro.id } });
    expect(updated.currentMarketValue).toBe(140_000);
  });

  it("recompute falls back to 0 when history is empty", async () => {
    const { pro } = await fixture();
    const record = await addMarketValue(db, {
      professionalId: pro.id,
      value: 100_000,
      recordedAt: new Date("2025-01-01T00:00:00Z"),
    });
    await db.marketValueRecord.delete({ where: { id: record.id } });
    expect(await recomputeCurrentMarketValue(db, pro.id)).toBe(0);
    const updated = await db.professional.findUniqueOrThrow({ where: { id: pro.id } });
    expect(updated.currentMarketValue).toBe(0);
  });

  it("rejects negative values", async () => {
    const { pro } = await fixture();
    await expect(
      addMarketValue(db, { professionalId: pro.id, value: -1, recordedAt: new Date() }),
    ).rejects.toThrow(/non-negative/);
  });
});

describe("rumors", () => {
  it("confirmRumor creates the transfer and moves the professional", async () => {
    const { acme, globex, pro } = await fixture();
    await createTransfer(db, {
      professionalId: pro.id,
      toCompanyId: acme.id,
      transferDate: new Date("2025-01-01T00:00:00Z"),
      type: "HIRE",
    });
    const rumor = await db.rumor.create({
      data: { professionalId: pro.id, targetCompanyId: globex.id, probability: 80, status: "HOT" },
    });
    const confirmed = await confirmRumor(db, rumor.id, new Date("2026-02-01T00:00:00Z"));
    expect(confirmed.status).toBe("CONFIRMED");
    expect(confirmed.probability).toBe(100);

    const updated = await db.professional.findUniqueOrThrow({ where: { id: pro.id } });
    expect(updated.currentCompanyId).toBe(globex.id);

    const transfers = await db.transfer.findMany({ where: { professionalId: pro.id } });
    expect(transfers).toHaveLength(2);
    const hire = transfers.find((t) => t.toCompanyId === globex.id);
    expect(hire?.fromCompanyId).toBe(acme.id);
    expect(hire?.type).toBe("HIRE");
  });

  it("confirmRumor is idempotent for already-confirmed rumors", async () => {
    const { globex, pro } = await fixture();
    const rumor = await db.rumor.create({
      data: { professionalId: pro.id, targetCompanyId: globex.id, probability: 80, status: "HOT" },
    });
    await confirmRumor(db, rumor.id);
    await confirmRumor(db, rumor.id);
    const transfers = await db.transfer.findMany({ where: { professionalId: pro.id } });
    expect(transfers).toHaveLength(1);
  });

  it("denyRumor sets DENIED with probability 0", async () => {
    const { globex, pro } = await fixture();
    const rumor = await db.rumor.create({
      data: { professionalId: pro.id, targetCompanyId: globex.id, probability: 60, status: "WARMING" },
    });
    const denied = await denyRumor(db, rumor.id);
    expect(denied.status).toBe("DENIED");
    expect(denied.probability).toBe(0);
    expect(await db.transfer.count()).toBe(0);
  });
});
