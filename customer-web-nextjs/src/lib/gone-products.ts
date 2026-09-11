/**
 * Katalogdan kalici olarak kaldirilmis (soft-delete) urun slug'lari.
 *
 * Neden gerekli: bu URL'ler bugun 404 doruyor. 404 "su an bulunamadi" demektir
 * ve Google URL'i uzun sure yeniden denemeye devam eder. 410 Gone ise "kalici
 * olarak yok" der ve indeksten cok daha hizli duser. Search Console'daki 664
 * "Bulunamadi (404)" kaydinin ~513'u bu gruptu.
 *
 * Middleware her istekte calistigi icin liste modul seviyesinde cache'lenir;
 * backend zaten 1 saat cache'liyor, burada da ayni TTL kullanilir.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "https://sportoonline.com/api/v1";

const TTL_MS = 60 * 60 * 1000; // 1 saat

let cache: { slugs: Set<string>; fetchedAt: number } | null = null;
let inFlight: Promise<Set<string>> | null = null;

async function load(): Promise<Set<string>> {
  const res = await fetch(`${BASE_URL}/sitemap/gone-products`, {
    // Middleware Edge/Node fark etmeksizin kendi TTL'imizi kullaniyoruz.
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`gone-products ${res.status}`);
  const body = (await res.json()) as { data?: unknown };
  const list = Array.isArray(body.data) ? body.data : [];
  return new Set(list.filter((s): s is string => typeof s === "string"));
}

export async function getGoneSlugs(): Promise<Set<string>> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < TTL_MS) return cache.slugs;

  // Ayni anda gelen istekler tek fetch paylassin
  if (!inFlight) {
    inFlight = load()
      .then((slugs) => {
        cache = { slugs, fetchedAt: Date.now() };
        return slugs;
      })
      .catch(() => {
        // Backend erisilemezse 410 verme — 404 davranisina dus.
        // Yanlislikla yasayan bir urunu "kalici yok" ilan etmek daha kotu.
        cache = { slugs: cache?.slugs ?? new Set(), fetchedAt: Date.now() };
        return cache.slugs;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}
