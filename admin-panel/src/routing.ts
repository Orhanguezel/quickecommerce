import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { availableLocales } from "./lib/language";

export const routing = defineRouting({
  locales: availableLocales,
  defaultLocale: "tr",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/client": "/client",
    "/about": "/about",
    "/client/redirect": "/client/redirect",
    "/nested": "/nested",
    "/redirect": "/redirect",
    "/news/[articleId]": "/news/[articleId]",
    "/news/just-in": "/news/just-in",
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
