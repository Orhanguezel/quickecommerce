// =============================================================
// FILE: src/config/index.ts
// FINAL — env-safe configuration (i18n flags + normalization)
// =============================================================

import invariant from "tiny-invariant";

const enableMultiLang = process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === "true";

const rawDefault = (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? "").trim();
invariant(rawDefault, "Default language is not set (NEXT_PUBLIC_DEFAULT_LANGUAGE)");

const rawAvailable = (process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES ?? "").trim();
if (enableMultiLang) {
  invariant(
    rawAvailable,
    "Available language is not set (NEXT_PUBLIC_AVAILABLE_LANGUAGES)"
  );
}

const parsedAvailable = rawAvailable
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const availableLanguages = enableMultiLang
  ? (parsedAvailable.length > 0 ? parsedAvailable : [rawDefault])
  : [rawDefault];

const defaultLanguage = availableLanguages.includes(rawDefault)
  ? rawDefault
  : availableLanguages[0];

export const Config = {
  broadcastDriver: process.env.NEXT_PUBLIC_API_BROADCAST_DRIVER ?? "log",
  pusherEnable: process.env.NEXT_PUBLIC_PUSHER_ENABLED ?? "false",

  enableMultiLang,
  availableLanguages,
  defaultLanguage,

  rtlLanguages: ["ar", "fa", "he"] as const,
  getDirection: (language?: string) => {
    if (!language) return "ltr";
    return Config.rtlLanguages.includes(language as any) ? "rtl" : "ltr";
  },
} as const;
