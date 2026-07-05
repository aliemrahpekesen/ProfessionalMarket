/** URL-safe slug: lowercase ascii, hyphen-separated. Handles Turkish chars. */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Make `base` unique against `exists` by appending -2, -3, … */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const root = slugify(base) || "item";
  let candidate = root;
  let i = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${i}`;
    i += 1;
  }
  return candidate;
}
