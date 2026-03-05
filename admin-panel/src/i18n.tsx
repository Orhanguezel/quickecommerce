import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import defaultMessages from "../public/locales/tr.json";
import { routing } from "./routing";

export default getRequestConfig(async (context: any) => {
  const requestedLocale = await context.requestLocale;
  const locale = routing.locales.includes(requestedLocale as any)
    ? requestedLocale
    : routing.defaultLocale;

  const now = (await headers()).get("x-now");
  const timeZone = (await headers()).get("x-time-zone") ?? "Europe/Vienna";
  const localeMessages = (await import(`../public/locales/${locale}.json`))
    .default;
  const messages = { ...defaultMessages, ...localeMessages };

  return {
    locale,
    now: now ? new Date(now) : undefined,
    timeZone,
    messages,
    defaultTranslationValues: {
      globalString: "Global string",
      highlight: (chunks: string) => <strong>{chunks}</strong>,
    },
    formats: {
      dateTime: {
        medium: {
          dateStyle: "medium",
          timeStyle: "short",
          hour12: false,
        },
      },
    },
    onError(error) {
      if (
        error.message ===
        (process.env.NODE_ENV === "production"
          ? "MISSING_MESSAGE"
          : "MISSING_MESSAGE: Could not resolve `missing` in `Index`.")
      ) {
      } else {
      }
    },
    getMessageFallback({ key, namespace }) {
      return (
        "`getMessageFallback` called for " +
        [namespace, key].filter((part) => part != null).join(".")
      );
    },
  };
});


