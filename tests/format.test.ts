import { describe, expect, it } from "vitest";
import { calcAge, formatDate, formatMoney, formatMoneyFull, toInputDate } from "@/lib/format";

describe("formatMoney", () => {
  it("renders millions with up to 2 significant decimals", () => {
    expect(formatMoney(1_250_000)).toBe("$1.25m");
    expect(formatMoney(12_500_000)).toBe("$12.5m");
    expect(formatMoney(1_000_000)).toBe("$1m");
  });

  it("rounds very large values to whole millions", () => {
    expect(formatMoney(200_000_000)).toBe("$200m");
    expect(formatMoney(199_600_000)).toBe("$200m");
  });

  it("renders thousands with one decimal", () => {
    expect(formatMoney(950_000)).toBe("$950k");
    expect(formatMoney(87_500)).toBe("$87.5k");
    expect(formatMoney(1_000)).toBe("$1k");
  });

  it("renders sub-thousand values plainly", () => {
    expect(formatMoney(999)).toBe("$999");
  });

  it("promotes across tier boundaries when rounding (issue #38)", () => {
    expect(formatMoney(999_999)).toBe("$1m");
    expect(formatMoney(999_950)).toBe("$1m");
    expect(formatMoney(999_400_000)).toBe("$999m");
    expect(formatMoney(999_500_000)).toBe("$1b");
  });

  it("renders billions (issue #38)", () => {
    expect(formatMoney(1_500_000_000)).toBe("$1.5b");
    expect(formatMoney(1_000_000_000)).toBe("$1b");
  });

  it("renders zero, negative and non-finite as dash", () => {
    expect(formatMoney(0)).toBe("-");
    expect(formatMoney(-5)).toBe("-");
    expect(formatMoney(Number.NaN)).toBe("-");
    expect(formatMoney(Number.POSITIVE_INFINITY)).toBe("-");
  });
});

describe("formatMoneyFull", () => {
  it("adds thousands separators", () => {
    expect(formatMoneyFull(1_250_000)).toBe("$1,250,000");
    expect(formatMoneyFull(0)).toBe("-");
  });
});

describe("calcAge", () => {
  it("computes age before and after birthday", () => {
    const birth = new Date("2000-07-21T00:00:00Z");
    expect(calcAge(birth, new Date("2026-07-20T00:00:00Z"))).toBe(25);
    expect(calcAge(birth, new Date("2026-07-21T00:00:00Z"))).toBe(26);
    expect(calcAge(birth, new Date("2026-07-22T00:00:00Z"))).toBe(26);
  });

  it("handles leap-day birthdays", () => {
    const birth = new Date("2000-02-29T00:00:00Z");
    expect(calcAge(birth, new Date("2026-02-28T00:00:00Z"))).toBe(25);
    expect(calcAge(birth, new Date("2026-03-01T00:00:00Z"))).toBe(26);
  });
});

describe("date formatting", () => {
  it("formats UTC dates deterministically", () => {
    expect(formatDate(new Date("2026-07-05T00:00:00Z"))).toBe("05 Jul 2026");
  });

  it("converts to input date format and back-fills empty", () => {
    expect(toInputDate(new Date("2026-01-02T00:00:00Z"))).toBe("2026-01-02");
    expect(toInputDate(null)).toBe("");
  });
});
