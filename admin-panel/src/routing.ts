import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { availableLocales } from "./lib/language";

export const routing = defineRouting({
  locales: availableLocales,
  defaultLocale: "en",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/client": "/client",
    "/about": "/about",
    "/client/redirect": "/client/redirect",
    "/nested": {
      en: "/nested",
      ar: "/verschachtelt",
    },
    "/redirect": "/redirect",
    "/news/[articleId]": {
      en: "/news/[articleId]",
      ar: "/neuigkeiten/[articleId]",
    },
    "/news/just-in": {
      en: "/news/just-in",
      ar: "/neuigkeiten/aktuell",
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
