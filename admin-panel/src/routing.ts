import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { availableLocales } from "./lib/language";

export const routing = defineRouting({
  locales: availableLocales,
  defaultLocale: "tr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
