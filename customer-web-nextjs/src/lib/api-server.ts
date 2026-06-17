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

  // endpoint path'inde ASCII-disi karakter olabilir (orn. Turkce slug "/urun/ürün-ışıl").
  // Ham birakirsak undici fetch "Cannot convert argument to a ByteString" firlatir ve
  // SSR coker. encodeURI path'teki ı/ş/ç... karakterlerini %-encode eder, URL yapisini
  // (/, ?, &, =) bozmaz. Query zaten URLSearchParams ile encode'lu, ona dokunmuyoruz.
  const url = `${BASE_URL}${encodeURI(endpoint)}?${search.toString()}`;

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
