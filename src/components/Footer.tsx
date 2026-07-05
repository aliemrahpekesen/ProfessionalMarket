import { t } from "@/lib/i18n";

export function Footer() {
  return (
    <footer className="mt-10 bg-[var(--pm-navy)] py-6 text-center text-xs text-gray-300">
      <p className="font-semibold">
        {t("app.name")} — {t("app.tagline")}
      </p>
      <p className="mt-1">{t("footer.disclaimer")}</p>
    </footer>
  );
}
