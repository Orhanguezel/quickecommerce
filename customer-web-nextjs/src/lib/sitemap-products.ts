import axios from "axios";

/**
 * Sitemap urun kaynagi — /sitemap/products endpoint'i (sayfasiz, backend'de
 * 1 saat cache'li) uzerinden tum satilabilir urunleri verir.
 *
 * Neden ayri dosya: urunler tek sitemap.xml'e sigdirilinca 10.6k URL / 3.4 MB
 * oluyor ve ilk (soguk cache) istek ~13 saniye suruyordu — Googlebot bu kadar
 * beklemeden vazgecebilir. Urunler CHUNK_SIZE'lik parcalara bolunup
 * /sitemap-products/N.xml olarak sunulur, sitemap_index.xml hepsini listeler.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "https://sportoonline.com/api/v1";

/** Parca basina URL sayisi. Google'in siniri 50.000; asil kisit yanit suresi. */
export const CHUNK_SIZE = 2500;

export interface SitemapProduct {
  slug: string;
  updatedAt?: string;
  locales: string[];
}

interface RawProduct {
  slug?: unknown;
  updated_at?: unknown;
  created_at?: unknown;
  locales?: unknown;
}

function normalize(item: RawProduct): SitemapProduct | null {
  const slug = typeof item.slug === "string" ? item.slug.trim() : "";
  if (!slug) return null;

  const updatedAtRaw =
    typeof item.updated_at === "string"
      ? item.updated_at
      : typeof item.created_at === "string"
        ? item.created_at
        : undefined;

  const parsed = updatedAtRaw ? new Date(updatedAtRaw) : null;
  const updatedAt =
    parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toISOString().slice(0, 10)
      : undefined;

  const locales = Array.isArray(item.locales)
    ? item.locales.filter((l): l is string => typeof l === "string")
    : [];

  return { slug, updatedAt, locales: locales.length ? locales : ["tr"] };
}

export async function fetchSitemapProducts(): Promise<SitemapProduct[]> {
  try {
    const res = await axios.get(`${BASE_URL}/sitemap/products`, { timeout: 60000 });
    const items = (res.data?.data ?? []) as RawProduct[];
    return items.map(normalize).filter(Boolean) as SitemapProduct[];
  } catch {
    // Bilerek bos: sitemap'in tamamen kirilmasindansa o parca bos kalsin.
    return [];
  }
}

export function chunkCount(total: number): number {
  return Math.max(1, Math.ceil(total / CHUNK_SIZE));
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Turkce karakterli slug'lar cift-encode edilmeden guvenli hale getirilir. */
export function encodeSlug(slug: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(slug));
  } catch {
    return encodeURIComponent(slug);
  }
}
