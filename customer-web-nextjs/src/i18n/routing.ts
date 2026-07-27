import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

// 2026-07-27: "en" locale KALDIRILDI (kullanici karari). Sitede gercek
// Ingilizce icerik yoktu — 10.626 urunun /en/ sayfasi Turkce metnin birebir
// kopyasiydi (duplicate content). Sadece 6 urunun cevirisi vardi.
// Eski /en/* URL'leri proxy.ts'te /tr/*'e 308 ile yonlenir; 404 uretilmez.
export const routing = defineRouting({
  locales: ["tr"],
  defaultLocale: "tr",
  localeDetection: false,
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
