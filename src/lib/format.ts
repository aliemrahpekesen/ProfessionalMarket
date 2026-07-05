// Formatting helpers. Market values are integer USD/year.

/** Transfermarkt-style money: $950k, $1.25m, $12.5m, $200m, $1.5b, "-" for 0/negative. */
export function formatMoney(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "-";
  if (value < 1_000) return `$${value}`;
  // Render in a tier, and promote to the next tier whenever rounding reaches
  // 1000 of the current unit (999_999 → "$1m", not "$1000k"). See issue #38.
  const k = renderScaled(value / 1_000, 1);
  if (Number(k) < 1000) return `$${k}k`;
  const m = renderScaled(value / 1_000_000, 2);
  if (Number(m) < 1000) return `$${m}m`;
  return `$${renderScaled(value / 1_000_000_000, 2)}b`;
}

/** <100 keeps up-to-`decimals` decimals; >=100 rounds to a whole number. */
function renderScaled(scaled: number, decimals: number): string {
  return scaled >= 100 ? Math.round(scaled).toString() : trimZeros(scaled.toFixed(decimals));
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
