"use server";

// All admin mutations. Every action re-checks the session (defense-in-depth on
// top of middleware) and validates input server-side before touching the DB.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, checkCredentials, createSessionToken } from "@/lib/auth";
import { requireAdmin } from "@/lib/adminSession";
import {
  createTransfer,
  addMarketValue,
  confirmRumor,
  denyRumor,
  recomputeCurrentMarketValue,
  recomputeCurrentCompany,
} from "@/lib/domain";
import { uniqueSlug, slugify } from "@/lib/slug";
import {
  COMPANY_TIERS,
  ROLE_GROUPS,
  RUMOR_STATUSES,
  SENIORITIES,
  TRANSFER_TYPES,
  isOneOf,
} from "@/lib/constants";

// ---------- auth ----------

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(email, password)) {
    redirect("/admin/login?error=1");
  }
  const token = await createSessionToken(email);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- helpers ----------

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string): number {
  const n = Number(String(formData.get(key) ?? "").replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function dateOrNull(formData: FormData, key: string): Date | null {
  const v = str(formData, key);
  if (!v) return null;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function optionalId(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v || null;
}

function refreshPublic() {
  revalidatePath("/", "layout");
}

// ---------- professionals ----------

export async function saveProfessionalAction(formData: FormData) {
  await requireAdmin();
  const id = optionalId(formData, "id");
  const firstName = str(formData, "firstName");
  const lastName = str(formData, "lastName");
  const role = str(formData, "role");
  const roleGroup = str(formData, "roleGroup");
  const seniority = str(formData, "seniority");
  const nationality = str(formData, "nationality").toUpperCase();
  const birthDate = dateOrNull(formData, "birthDate");

  if (!firstName || !lastName || !role || !birthDate) throw new Error("Missing required fields");
  if (!isOneOf(ROLE_GROUPS, roleGroup)) throw new Error("Invalid role group");
  if (!isOneOf(SENIORITIES, seniority)) throw new Error("Invalid seniority");
  if (!/^[A-Z]{2}$/.test(nationality)) throw new Error("Nationality must be a 2-letter country code");

  const data = {
    firstName,
    lastName,
    role,
    roleGroup,
    seniority,
    nationality,
    birthDate,
    city: str(formData, "city"),
    bio: str(formData, "bio"),
    skills: str(formData, "skills"),
    openToOffers: formData.get("openToOffers") === "on",
    contractUntil: dateOrNull(formData, "contractUntil"),
    currentCompanyId: optionalId(formData, "currentCompanyId"),
    agencyId: optionalId(formData, "agencyId"),
  };

  if (id) {
    await prisma.professional.update({ where: { id }, data });
  } else {
    const slug = await uniqueSlug(`${firstName} ${lastName}`, async (s) =>
      Boolean(await prisma.professional.findUnique({ where: { slug: s } })),
    );
    const created = await prisma.professional.create({ data: { ...data, slug } });
    const initialValue = num(formData, "initialMarketValue");
    if (Number.isFinite(initialValue) && initialValue > 0) {
      await addMarketValue(prisma, {
        professionalId: created.id,
        value: initialValue,
        recordedAt: new Date(),
        note: "Initial valuation",
      });
    }
  }
  refreshPublic();
  redirect("/admin/professionals");
}

export async function deleteProfessionalAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) await prisma.professional.delete({ where: { id } });
  refreshPublic();
  redirect("/admin/professionals");
}

// ---------- companies ----------

export async function saveCompanyAction(formData: FormData) {
  await requireAdmin();
  const id = optionalId(formData, "id");
  const name = str(formData, "name");
  const tier = str(formData, "tier");
  const industryId = str(formData, "industryId");
  if (!name || !industryId) throw new Error("Missing required fields");
  if (!isOneOf(COMPANY_TIERS, tier)) throw new Error("Invalid tier");

  const foundedYear = num(formData, "foundedYear");
  const employeeCount = num(formData, "employeeCount");
  const data = {
    name,
    tier,
    industryId,
    hqCity: str(formData, "hqCity"),
    hqCountry: str(formData, "hqCountry").toUpperCase(),
    website: str(formData, "website"),
    logoColor: str(formData, "logoColor") || "#00193f",
    foundedYear: Number.isFinite(foundedYear) && foundedYear > 0 ? Math.round(foundedYear) : null,
    employeeCount: Number.isFinite(employeeCount) && employeeCount > 0 ? Math.round(employeeCount) : null,
  };

  if (id) {
    await prisma.company.update({ where: { id }, data });
  } else {
    const slug = await uniqueSlug(name, async (s) =>
      Boolean(await prisma.company.findUnique({ where: { slug: s } })),
    );
    await prisma.company.create({ data: { ...data, slug } });
  }
  refreshPublic();
  redirect("/admin/companies");
}

export async function deleteCompanyAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) {
    const rosterCount = await prisma.professional.count({ where: { currentCompanyId: id } });
    if (rosterCount > 0) {
      redirect("/admin/companies?error=roster");
    }
    await prisma.company.delete({ where: { id } });
  }
  refreshPublic();
  redirect("/admin/companies");
}

// ---------- transfers ----------

export async function createTransferAction(formData: FormData) {
  await requireAdmin();
  const professionalId = str(formData, "professionalId");
  const transferDate = dateOrNull(formData, "transferDate");
  const type = str(formData, "type");
  if (!professionalId || !transferDate) throw new Error("Missing required fields");
  if (!isOneOf(TRANSFER_TYPES, type)) throw new Error("Invalid transfer type");
  const pkg = num(formData, "package");

  await createTransfer(prisma, {
    professionalId,
    fromCompanyId: optionalId(formData, "fromCompanyId"),
    toCompanyId: optionalId(formData, "toCompanyId"),
    transferDate,
    type,
    package: Number.isFinite(pkg) ? pkg : 0,
    roleAfter: str(formData, "roleAfter"),
    note: str(formData, "note"),
  });
  refreshPublic();
  redirect("/admin/transfers");
}

export async function deleteTransferAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) {
    const transfer = await prisma.transfer.findUnique({ where: { id } });
    if (transfer) {
      await prisma.transfer.delete({ where: { id } });
      // Keep current company/role consistent with remaining history (#39).
      await recomputeCurrentCompany(prisma, transfer.professionalId);
    }
  }
  refreshPublic();
  redirect("/admin/transfers");
}

// ---------- market values ----------

export async function addMarketValueAction(formData: FormData) {
  await requireAdmin();
  const professionalId = str(formData, "professionalId");
  const recordedAt = dateOrNull(formData, "recordedAt");
  const value = num(formData, "value");
  if (!professionalId || !recordedAt) throw new Error("Missing required fields");
  if (!Number.isFinite(value) || value < 0) throw new Error("Value must be a non-negative number");

  await addMarketValue(prisma, { professionalId, value, recordedAt, note: str(formData, "note") });
  refreshPublic();
  redirect("/admin/market-values");
}

export async function deleteMarketValueAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) {
    const record = await prisma.marketValueRecord.findUnique({ where: { id } });
    if (record) {
      await prisma.marketValueRecord.delete({ where: { id } });
      await recomputeCurrentMarketValue(prisma, record.professionalId);
    }
  }
  refreshPublic();
  redirect("/admin/market-values");
}

// ---------- rumors ----------

export async function saveRumorAction(formData: FormData) {
  await requireAdmin();
  const professionalId = str(formData, "professionalId");
  const targetCompanyId = str(formData, "targetCompanyId");
  const status = str(formData, "status");
  const probability = num(formData, "probability");
  if (!professionalId || !targetCompanyId) throw new Error("Missing required fields");
  // Only open statuses can be set on create; CONFIRMED/DENIED must go through
  // the confirm/deny actions so their invariants hold (#40).
  const OPEN_STATUSES = RUMOR_STATUSES.filter((s) => s !== "CONFIRMED" && s !== "DENIED");
  if (!isOneOf(OPEN_STATUSES, status)) throw new Error("Invalid rumor status");
  if (!Number.isFinite(probability) || probability < 0 || probability > 100) {
    throw new Error("Probability must be between 0 and 100");
  }

  await prisma.rumor.create({
    data: {
      professionalId,
      targetCompanyId,
      status,
      probability: Math.round(probability),
      source: str(formData, "source"),
      note: str(formData, "note"),
    },
  });
  refreshPublic();
  redirect("/admin/rumors");
}

export async function confirmRumorAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) await confirmRumor(prisma, id);
  refreshPublic();
  redirect("/admin/rumors");
}

export async function denyRumorAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) await denyRumor(prisma, id);
  refreshPublic();
  redirect("/admin/rumors");
}

export async function deleteRumorAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) await prisma.rumor.delete({ where: { id } });
  refreshPublic();
  redirect("/admin/rumors");
}

// ---------- news ----------

export async function saveNewsAction(formData: FormData) {
  await requireAdmin();
  const id = optionalId(formData, "id");
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!title || !body) throw new Error("Title and body are required");
  const publishedAt = dateOrNull(formData, "publishedAt") ?? new Date();

  const data = {
    title,
    body,
    publishedAt,
    professionalId: optionalId(formData, "professionalId"),
    companyId: optionalId(formData, "companyId"),
  };

  if (id) {
    await prisma.newsItem.update({ where: { id }, data });
  } else {
    const slug = await uniqueSlug(slugify(title).slice(0, 60), async (s) =>
      Boolean(await prisma.newsItem.findUnique({ where: { slug: s } })),
    );
    await prisma.newsItem.create({ data: { ...data, slug } });
  }
  refreshPublic();
  redirect("/admin/news");
}

export async function deleteNewsAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) await prisma.newsItem.delete({ where: { id } });
  refreshPublic();
  redirect("/admin/news");
}
