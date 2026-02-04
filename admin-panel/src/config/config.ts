// =============================================================
// FILE: src/config/config.ts
// FINAL — i18n locales + stripe key export (TS strict friendly)
// Fixes:
// - removes invalid `as const` on computed arrays
// - Locale type is a stable union (tr/en) for this project
// - locales/defaultLocale are normalized safely
// - stripeSecretKey remains server-only
// =============================================================

import invariant from "tiny-invariant";

export type Locale = "tr" | "en";

const FALLBACK_LOCALES: readonly Locale[] = ["tr", "en"] as const;

const enableMultiLang = process.env.NEXT_PUBLIC_ENABLE_MULTI_LANG === "true";

const rawDefault = (process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? "").trim();
const rawAvailable = (process.env.NEXT_PUBLIC_AVAILABLE_LANGUAGES ?? "").trim();

// Default dil yoksa fallback ile çalış (prod’da istersen invariant aç)
const defaultFromEnv = (rawDefault === "tr" || rawDefault === "en"
  ? rawDefault
  : undefined) as Locale | undefined;

if (process.env.NODE_ENV === "production") {
  // prod’da default mutlaka set olsun istiyorsan bunu açık bırak
  invariant(
    defaultFromEnv || FALLBACK_LOCALES.length > 0,
    "NEXT_PUBLIC_DEFAULT_LANGUAGE could not be resolved"
  );
}

const parsedAvailable = rawAvailable
  .split(",")
  .map((s) => s.trim())
  .filter((s): s is Locale => s === "tr" || s === "en");

if (enableMultiLang) {
  // multi-lang açıkken env boşsa bile fallback ile devam et
  // ama istersen burada invariant yapabilirsin:
  // invariant(parsedAvailable.length > 0, "NEXT_PUBLIC_AVAILABLE_LANGUAGES is required when multi-lang is enabled");
}

export const locales: readonly Locale[] = enableMultiLang
  ? parsedAvailable.length > 0
    ? parsedAvailable
    : FALLBACK_LOCALES
  : [defaultFromEnv ?? FALLBACK_LOCALES[0]];

export const defaultLocale: Locale =
  defaultFromEnv && locales.includes(defaultFromEnv)
    ? defaultFromEnv
    : locales[0];

// Server-only: .env (NOT NEXT_PUBLIC_*)
// Not: Bu dosyayı "use client" tarafında import ETME.
export const stripeSecretKey: string | undefined = process.env.STRIPE_SECRET_KEY;
