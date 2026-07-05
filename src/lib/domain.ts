// Domain service layer — the single write-path for operations with integrity
// rules (see docs/DOMAIN-MODEL.md "Business rules"). Used by admin actions,
// the seed script, and integration tests.

import type { PrismaClient, Transfer, MarketValueRecord, Rumor } from "@prisma/client";
import { isOneOf, TRANSFER_TYPES, RUMOR_STATUSES } from "./constants";

type Db = Pick<PrismaClient, "professional" | "transfer" | "marketValueRecord" | "rumor" | "$transaction">;

export interface CreateTransferInput {
  professionalId: string;
  fromCompanyId?: string | null;
  toCompanyId?: string | null;
  transferDate: Date;
  type: string;
  package?: number;
  roleAfter?: string;
  note?: string;
}

/**
 * Record a job move. If it is the professional's most recent transfer, their
 * current company (and role, when roleAfter given) is updated. Market value at
 * transfer is snapshotted from the current value.
 */
export async function createTransfer(db: Db, input: CreateTransferInput): Promise<Transfer> {
  if (!isOneOf(TRANSFER_TYPES, input.type)) {
    throw new Error(`Invalid transfer type: ${input.type}`);
  }
  if (input.package != null && (input.package < 0 || !Number.isFinite(input.package))) {
    throw new Error("Package must be a non-negative number");
  }
  const professional = await db.professional.findUniqueOrThrow({ where: { id: input.professionalId } });

  const transfer = await db.transfer.create({
    data: {
      professionalId: input.professionalId,
      fromCompanyId: input.fromCompanyId ?? null,
      toCompanyId: input.toCompanyId ?? null,
      transferDate: input.transferDate,
      type: input.type,
      package: Math.round(input.package ?? 0),
      marketValueAtTransfer: professional.currentMarketValue,
      roleAfter: input.roleAfter ?? "",
      note: input.note ?? "",
    },
  });

  const newest = await db.transfer.findFirst({
    where: { professionalId: input.professionalId },
    orderBy: [{ transferDate: "desc" }, { createdAt: "desc" }],
  });
  if (newest && newest.id === transfer.id) {
    await db.professional.update({
      where: { id: input.professionalId },
      data: {
        currentCompanyId: transfer.toCompanyId,
        ...(input.roleAfter ? { role: input.roleAfter } : {}),
      },
    });
  }
  return transfer;
}

export interface AddMarketValueInput {
  professionalId: string;
  value: number;
  recordedAt: Date;
  note?: string;
}

/**
 * Append a market value record. The professional's denormalized
 * currentMarketValue always equals the newest record's value.
 */
export async function addMarketValue(db: Db, input: AddMarketValueInput): Promise<MarketValueRecord> {
  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new Error("Market value must be a non-negative number");
  }
  const record = await db.marketValueRecord.create({
    data: {
      professionalId: input.professionalId,
      value: Math.round(input.value),
      recordedAt: input.recordedAt,
      note: input.note ?? "",
    },
  });
  await recomputeCurrentMarketValue(db, input.professionalId);
  return record;
}

/** Recompute currentMarketValue from the newest record (0 when none exist). */
export async function recomputeCurrentMarketValue(db: Db, professionalId: string): Promise<number> {
  const newest = await db.marketValueRecord.findFirst({
    where: { professionalId },
    orderBy: { recordedAt: "desc" },
  });
  const value = newest?.value ?? 0;
  await db.professional.update({ where: { id: professionalId }, data: { currentMarketValue: value } });
  return value;
}

/**
 * Confirm a rumor: status CONFIRMED, probability 100, and the corresponding
 * HIRE transfer is created (dated `at`).
 */
export async function confirmRumor(db: Db, rumorId: string, at: Date = new Date()): Promise<Rumor> {
  const rumor = await db.rumor.findUniqueOrThrow({ where: { id: rumorId } });
  if (rumor.status === "CONFIRMED") return rumor;
  const professional = await db.professional.findUniqueOrThrow({ where: { id: rumor.professionalId } });
  await createTransfer(db, {
    professionalId: rumor.professionalId,
    fromCompanyId: professional.currentCompanyId,
    toCompanyId: rumor.targetCompanyId,
    transferDate: at,
    type: "HIRE",
    package: professional.currentMarketValue,
    note: "Confirmed rumor",
  });
  return db.rumor.update({
    where: { id: rumorId },
    data: { status: "CONFIRMED", probability: 100 },
  });
}

/** Deny a rumor: status DENIED, probability 0. */
export async function denyRumor(db: Db, rumorId: string): Promise<Rumor> {
  return db.rumor.update({ where: { id: rumorId }, data: { status: "DENIED", probability: 0 } });
}

export function assertRumorStatus(status: string): void {
  if (!isOneOf(RUMOR_STATUSES, status)) throw new Error(`Invalid rumor status: ${status}`);
}
