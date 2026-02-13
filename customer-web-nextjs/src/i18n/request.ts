import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "tr" | "en")) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../../public/locales/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
