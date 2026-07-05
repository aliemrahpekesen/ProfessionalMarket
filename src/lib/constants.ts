// Enum-like domain vocabularies. Stored as strings in SQLite (Prisma enums are
// unsupported there); every mutation validates against these lists.

export const COMPANY_TIERS = ["STARTUP", "SCALEUP", "ENTERPRISE", "FORTUNE500"] as const;
export type CompanyTier = (typeof COMPANY_TIERS)[number];

export const ROLE_GROUPS = [
  "ENGINEERING",
  "PRODUCT",
  "DESIGN",
  "DATA",
  "MARKETING",
  "SALES",
  "OPERATIONS",
  "FINANCE",
  "EXECUTIVE",
] as const;
export type RoleGroup = (typeof ROLE_GROUPS)[number];

export const SENIORITIES = [
  "JUNIOR",
  "MID",
  "SENIOR",
  "STAFF",
  "PRINCIPAL",
  "DIRECTOR",
  "VP",
  "CLEVEL",
] as const;
export type Seniority = (typeof SENIORITIES)[number];

export const TRANSFER_TYPES = ["HIRE", "CONTRACT", "SECONDMENT", "PROMOTION", "FREE_AGENT"] as const;
export type TransferType = (typeof TRANSFER_TYPES)[number];

export const RUMOR_STATUSES = ["HOT", "WARMING", "COLD", "CONFIRMED", "DENIED"] as const;
export type RumorStatus = (typeof RUMOR_STATUSES)[number];

export const TIER_LABELS: Record<CompanyTier, string> = {
  STARTUP: "Startup",
  SCALEUP: "Scale-up",
  ENTERPRISE: "Enterprise",
  FORTUNE500: "Fortune 500",
};

export const ROLE_GROUP_LABELS: Record<RoleGroup, string> = {
  ENGINEERING: "Engineering",
  PRODUCT: "Product",
  DESIGN: "Design",
  DATA: "Data",
  MARKETING: "Marketing",
  SALES: "Sales",
  OPERATIONS: "Operations",
  FINANCE: "Finance",
  EXECUTIVE: "Executive",
};

export const SENIORITY_LABELS: Record<Seniority, string> = {
  JUNIOR: "Junior",
  MID: "Mid-level",
  SENIOR: "Senior",
  STAFF: "Staff",
  PRINCIPAL: "Principal",
  DIRECTOR: "Director",
  VP: "VP",
  CLEVEL: "C-level",
};

export const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  HIRE: "Hire",
  CONTRACT: "Contract",
  SECONDMENT: "Secondment",
  PROMOTION: "Promotion",
  FREE_AGENT: "Free agent",
};

export const RUMOR_STATUS_LABELS: Record<RumorStatus, string> = {
  HOT: "Hot",
  WARMING: "Warming",
  COLD: "Cold",
  CONFIRMED: "Confirmed",
  DENIED: "Denied",
};

export const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  TR: "Türkiye",
  NL: "Netherlands",
  ES: "Spain",
  IT: "Italy",
  SE: "Sweden",
  PL: "Poland",
  IN: "India",
  BR: "Brazil",
  JP: "Japan",
  SG: "Singapore",
  AE: "United Arab Emirates",
  CA: "Canada",
  AU: "Australia",
  KR: "South Korea",
};

export function isOneOf<T extends readonly string[]>(list: T, value: string): value is T[number] {
  return (list as readonly string[]).includes(value);
}

export function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}
