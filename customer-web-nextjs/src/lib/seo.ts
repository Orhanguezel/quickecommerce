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
