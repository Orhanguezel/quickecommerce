const PRODUCTION_SITE_URL = "https://sportoonline.com";

function normalizeSiteUrl(value?: string): string {
  if (!value) return PRODUCTION_SITE_URL;

  try {
    const url = new URL(value);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return PRODUCTION_SITE_URL;
    }
    return url.origin;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = "Sportoonline";

export const DEFAULT_ORGANIZATION = {
  name: SITE_NAME,
  legalName: "Sportoonline",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon/favicon-96x96.png`,
  email: "sportoonlinecom@gmail.com",
  address: {
    streetAddress: "1671 sokak no 151c aksoy",
    addressLocality: "Karşıyaka",
    addressRegion: "İzmir",
    postalCode: "",
    addressCountry: "TR",
  },
  sameAs: [
    "https://www.instagram.com/sportoonline",
    "https://www.facebook.com/sportoonline",
    "https://www.linkedin.com/in/sporto-online-965632409/",
    "https://www.linkedin.com/company/sportoonline",
    "https://www.youtube.com/@sportoonline6835",
    "https://www.sikayetvar.com/sportoonline",
  ],
};

export function cleanContactPhone(value?: string | null): string | undefined {
  const phone = value?.trim();
  if (!phone) return undefined;

  const digits = phone.replace(/\D/g, "");
  const compact = phone.toLocaleLowerCase("tr-TR");
  const looksPlaceholder =
    /(^|\D)555(\D|$)/.test(phone) ||
    digits.includes("212555") ||
    compact.includes("placeholder") ||
    compact.includes("örnek") ||
    compact.includes("ornek");

  return looksPlaceholder ? undefined : phone;
}

const turkishMonths: Record<string, string> = {
  ocak: "01",
  subat: "02",
  şubat: "02",
  mart: "03",
  nisan: "04",
  mayis: "05",
  mayıs: "05",
  haziran: "06",
  temmuz: "07",
  agustos: "08",
  ağustos: "08",
  eylul: "09",
  eylül: "09",
  ekim: "10",
  kasim: "11",
  kasım: "11",
  aralik: "12",
  aralık: "12",
};

export function stripHtml(value?: string | null): string {
  return (value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
}

export function toIsoDate(value?: string | null): string | undefined {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  const match = value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .match(/^(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{4})$/i);

  if (!match) return undefined;

  const [, day, monthName, year] = match;
  const month = turkishMonths[monthName];
  if (!month) return undefined;

  return `${year}-${month}-${day.padStart(2, "0")}T00:00:00.000Z`;
}

export function priceValidUntil(days = 90): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function localizedAlternates(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const trPath = `/tr${normalizedPath === "/" ? "" : normalizedPath}`;
  // "en" locale kaldirildi (2026-07-27) — hreflang'de artik yalnizca tr var.
  // Var olmayan bir dile alternate vermek Google'a kirik sinyal gonderir.
  return {
    tr: trPath,
    "x-default": trPath,
  };
}

export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * SEO basligini 30-60 karakter araliginda tutar.
 *
 * Tanitio SEO katalogu (2026-09-11) 5 urun sayfasinda "baslik 60 karakteri
 * asiyor" bulgusu verdi: DB'deki meta_title zaten uzunken layout'taki
 * `%s | ${siteName}` sablonu 15 karakter daha ekliyordu. Adaylar en zenginden
 * en sadeye dogru denenir, 60'a sigan ilki secilir.
 */
export function buildPageTitle(
  candidates: Array<string | null | undefined>,
  siteName: string,
  maxLength = 60
): string {
  const suffix = siteName ? ` | ${siteName}` : "";
  const cleaned = candidates
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  const ordered: string[] = [];
  for (const value of cleaned) {
    // Baslik zaten marka ekini tasiyorsa ikinci kez eklemeyiz.
    const hasSuffix = suffix && value.toLowerCase().endsWith(suffix.trim().toLowerCase());
    if (!hasSuffix && suffix) ordered.push(`${value}${suffix}`);
    ordered.push(value);
  }

  const fitting = ordered.find((value) => value.length <= maxLength);
  if (fitting) return fitting;

  const fallback = ordered[0] ?? siteName;
  return truncateText(fallback, maxLength);
}

/**
 * Urun meta aciklamasi icin 70-160 karakter araliginda metin uretir.
 *
 * Katalogdaki 43/45/58 karakterlik aciklamalar DB'de meta_description alanina
 * urun adinin kopyalanmasindan geliyordu; bu SERP'te bos alan birakir.
 */
export function buildProductDescription(input: {
  metaDescription?: string | null;
  description?: string | null;
  name: string;
  brand?: string | null;
  category?: string | null;
  siteName: string;
  minLength?: number;
  maxLength?: number;
}): string {
  const min = input.minLength ?? 70;
  const max = input.maxLength ?? 160;

  const meta = input.metaDescription?.trim();
  if (meta && meta.length >= min) return truncateText(meta, max);

  const body = stripHtml(input.description);
  if (body.length >= min) return truncateText(body, max);

  const parts = [input.name.trim()];
  if (input.brand?.trim()) parts.push(input.brand.trim());
  if (input.category?.trim()) parts.push(input.category.trim());

  const head = parts.join(" · ");
  const tail = `${input.siteName} güvencesiyle: güncel fiyat, stok durumu, hızlı kargo ve kolay iade.`;
  return truncateText(`${head} — ${tail}`, max);
}
