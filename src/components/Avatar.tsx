// Monogram avatar — stands in for headshots/logos (all data is fictional).

export function Avatar({
  name,
  color,
  size = 40,
  square = false,
}: {
  name: string;
  color: string;
  size?: number;
  square?: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center font-semibold text-white ${square ? "rounded-md" : "rounded-full"}`}
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}
