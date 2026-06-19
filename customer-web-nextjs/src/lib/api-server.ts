const BASE_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "https://sportoonline.com/api/v1";

/**
 * SSR fetch wrapper.
 *
 * Native fetch + `next.revalidate` ile Next.js Data Cache devreye girer:
 * aynı URL için 60sn boyunca tek backend hit, sonraki tüm SSR'lar cache'ten.
 * Önceki versiyon axios kullanıyordu → cache devre dışıydı, her sayfa load
 * 10 backend call → TTFB 2-3s. Bu refactor anasayfayı ~200ms TTFB'ye indirir
 * (cold cache 2-3s yine olabilir, hot cache 200ms).
 */

// Path segmentlerini TEK seferde encode'a normalize eder.
// Next.js 16 dinamik route param'i (urun/[slug]) bazen ZATEN encode'lu verir
// (orn. "kaps%C3%BCl"); duz encodeURI(path) bunu "%"->"%25" ile CIFT-encode edip
// (kaps%25C3%25BCl) backend'de slug eslesmesini bozar -> Turkce karakterli slug'lar
// 404 doner (ksm-66-...-kapsül, ligone-...-kapsül vakasi 2026-06-18).
// decodeURIComponent + encodeURIComponent: girdi ister encode'lu ister raw (ü/ş/ç)
// olsun tek-encode'a indirger. Bozuk %-dizilimi varsa segment'i oldugu gibi birakir.
function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return segment;
      }
    })
    .join("/");
}

export async function fetchAPI<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
  locale: string = "tr",
  revalidate: number = 60,
): Promise<T> {
  const search = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      search.set(k, String(v));
    }
  }
  search.set("language", locale);

  // endpoint "/path" ya da "/path?zaten=encode'lu&query" olabilir.
  // Path encodePath ile TEK-encode'a normalize edilir (Turkce slug ByteString +
  // Next param cift-encode korumasi). Query string'e DOKUNULMAZ — URLSearchParams
  // ile zaten encode'lu; ona encode uygularsak category_id[]/brand_id[] bozulur.
  const qIndex = endpoint.indexOf("?");
  const path = qIndex >= 0 ? endpoint.slice(0, qIndex) : endpoint;
  const existingQuery = qIndex >= 0 ? endpoint.slice(qIndex + 1) : "";
  const sep = existingQuery ? "&" : "";
  const url = `${BASE_URL}${encodePath(path)}?${existingQuery}${sep}${search.toString()}`;

  const res = await fetch(url, {
    headers: {
      "X-localization": locale,
      Accept: "application/json",
    },
    next: { revalidate },
    // 15sn timeout — native fetch'te AbortSignal.timeout
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`fetchAPI ${endpoint} HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
