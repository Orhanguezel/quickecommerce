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
  // encodeURI SADECE path'e uygulanir: Turkce slug'daki ı/ş/ç... %-encode edilip
  // undici "ByteString" hatasi onlenir. Query string'e DOKUNULMAZ — cunku
  // URLSearchParams ile zaten encode'lu; encodeURI %'i de encode edip cift-encode
  // (%5B -> %255B) yapar ve category_id[]/brand_id[] gibi array filtrelerini bozar.
  const qIndex = endpoint.indexOf("?");
  const path = qIndex >= 0 ? endpoint.slice(0, qIndex) : endpoint;
  const existingQuery = qIndex >= 0 ? endpoint.slice(qIndex + 1) : "";
  const sep = existingQuery ? "&" : "";
  const url = `${BASE_URL}${encodeURI(path)}?${existingQuery}${sep}${search.toString()}`;

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
