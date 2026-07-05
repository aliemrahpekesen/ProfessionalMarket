import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Nexora Systems")).toBe("nexora-systems");
  });

  it("transliterates Turkish characters", () => {
    expect(slugify("Şahin Çelik Iğdır")).toBe("sahin-celik-igdir");
    expect(slugify("İstanbul Ünlü Ömer")).toBe("istanbul-unlu-omer");
  });

  it("strips accents and punctuation", () => {
    expect(slugify("Chloé Lefèvre!")).toBe("chloe-lefevre");
    expect(slugify("  --hello--world--  ")).toBe("hello-world");
  });

  it("falls back to empty string for symbol-only input", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("returns base slug when free", async () => {
    expect(await uniqueSlug("Ada Lovelace", async () => false)).toBe("ada-lovelace");
  });

  it("appends counter until free", async () => {
    const taken = new Set(["ada-lovelace", "ada-lovelace-2"]);
    expect(await uniqueSlug("Ada Lovelace", async (s) => taken.has(s))).toBe("ada-lovelace-3");
  });

  it("uses fallback root for empty input", async () => {
    expect(await uniqueSlug("!!!", async () => false)).toBe("item");
  });
});
