// i18n-ready copy dictionary. v1 ships English; Turkish prepared.
// Adding a locale = adding a dictionary entry; components call t("key").

export type Locale = "en" | "tr";

const DICTIONARIES: Record<Locale, Record<string, string>> = {
  en: {
    "app.name": "ProfessionalMarket",
    "app.tagline": "The Transfermarkt of the business world",
    "nav.home": "Home",
    "nav.rankings": "Market Values",
    "nav.transfers": "Transfers",
    "nav.rumors": "Rumors",
    "nav.companies": "Companies",
    "nav.industries": "Industries",
    "nav.professionals": "Professionals",
    "nav.news": "News",
    "nav.admin": "Admin",
    "search.placeholder": "Search professionals or companies…",
    "search.button": "Search",
    "footer.disclaimer": "All people, companies and values on this site are fictional demo data.",
    "common.marketValue": "Market value",
    "common.freeAgent": "Free agent",
    "common.viewAll": "View all",
  },
  tr: {
    "app.name": "ProfessionalMarket",
    "app.tagline": "İş dünyasının Transfermarkt'ı",
    "nav.home": "Ana Sayfa",
    "nav.rankings": "Piyasa Değerleri",
    "nav.transfers": "Transferler",
    "nav.rumors": "Söylentiler",
    "nav.companies": "Şirketler",
    "nav.industries": "Sektörler",
    "nav.professionals": "Profesyoneller",
    "nav.news": "Haberler",
    "nav.admin": "Yönetim",
    "search.placeholder": "Profesyonel veya şirket ara…",
    "search.button": "Ara",
    "footer.disclaimer": "Bu sitedeki tüm kişi, şirket ve değerler kurgusal demo verisidir.",
    "common.marketValue": "Piyasa değeri",
    "common.freeAgent": "Serbest",
    "common.viewAll": "Tümünü gör",
  },
};

const DEFAULT_LOCALE: Locale = "en";

export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  return DICTIONARIES[locale][key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
}
