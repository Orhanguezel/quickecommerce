import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Locale listesi routing.ts'ten gelir; elle yazilan birlesim tipi
  // ("tr" | "en") liste degisince derlemeyi kirdigi icin turetiliyor.
  type AppLocale = (typeof routing.locales)[number];

  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../../public/locales/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
