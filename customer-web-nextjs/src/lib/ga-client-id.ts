import { analyticsConsentGranted } from "@/lib/gtm";

/**
 * GA4 client id'yi `_ga` cerezinden okur ("GA1.1.<a>.<b>" -> "<a>.<b>").
 *
 * YALNIZ analitik cerez izni verilmisse deger doner; izin yoksa, cerez yoksa
 * veya bicim beklenmedikse `undefined`. Backend bu degeri siparise yazar ve
 * sunucu tarafi GA4 purchase/refund (Measurement Protocol) icin kullanir.
 */
export function getGaClientIdWithConsent(): string | undefined {
  if (typeof document === "undefined") return undefined;
  if (!analyticsConsentGranted()) return undefined;

  const match = /(?:^|;\s*)_ga=([^;]*)/.exec(document.cookie);
  if (!match) return undefined;

  let raw = match[1];
  try {
    raw = decodeURIComponent(raw);
  } catch {
    return undefined;
  }

  // GA1.<n>.<random>.<timestamp> -> son iki parca
  const parts = raw.split(".");
  if (parts.length < 4) return undefined;
  const clientId = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;

  return /^\d{1,20}\.\d{1,20}$/.test(clientId) ? clientId : undefined;
}
