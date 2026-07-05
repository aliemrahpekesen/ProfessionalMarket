// Formatting helpers. Market values are integer USD/year.

/** Transfermarkt-style money: $950k, $1.25m, $12.5m, $200m, "-" for 0/negative. */
export function formatMoney(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "-";
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    const rounded = m >= 100 ? Math.round(m).toString() : trimZeros(m.toFixed(2));
    return `$${rounded}m`;
  }
  if (value >= 1_000) {
    return `$${trimZeros((value / 1_000).toFixed(1))}k`;
  }
  return `$${value}`;
}

function trimZeros(s: string): string {
  return s.replace(/\.?0+$/, "");
}

/** Full money with thousands separators, e.g. $1,250,000. */
export function formatMoneyFull(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "-";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/** Age in whole years at `at` (defaults to now), UTC date math. */
export function calcAge(birthDate: Date, at: Date = new Date()): number {
  let age = at.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    at.getUTCMonth() < birthDate.getUTCMonth() ||
    (at.getUTCMonth() === birthDate.getUTCMonth() && at.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(d: Date): string {
  return DATE_FMT.format(d);
}

const MONTH_FMT = new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });

export function formatMonthShort(d: Date): string {
  return MONTH_FMT.format(d);
}

/** yyyy-mm-dd for date inputs. */
export function toInputDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}
