/**
 * Görsel URL'lerindeki ASCII-dışı karakterleri (Türkçe ş/ı/ç, boşluk vb.) güvenli
 * şekilde tek-encode'a normalize eder.
 *
 * NEDEN: Bazı tedarikçi görselleri ham non-ASCII içeriyor
 * (ör. proteinmax `.../data/Prime/Saşe Prime/...png`). `next.config` `images.
 * unoptimized: true` olduğu için Next.js bu URL'i ham haliyle kullanıyor ve
 * `<Image priority>` için bir `Link: <url>; rel=preload` HTTP header'ı üretiyor.
 * HTTP header değeri latin1/ByteString olduğundan 'ş' (0x15F) gibi karakterler
 * "Cannot convert argument to a ByteString" ile SSR'ı 500'e düşürüyordu
 * (ürün sayfası, Googlebot dahil).
 *
 * Yaklaşım: zaten ASCII ise dokunma (yaygın durum, sıfır maliyet). Değilse
 * URL'in yalnız PATH segmentlerini tek-encode'a indir (zaten encode'luyu
 * çift-encode etme); scheme/host/query korunur.
 */
export function encodeImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(url)) return url; // tamamen ASCII -> dokunma

  try {
    const u = new URL(url);
    u.pathname = u.pathname
      .split("/")
      .map((seg) => {
        try {
          return encodeURIComponent(decodeURIComponent(seg));
        } catch {
          return encodeURIComponent(seg);
        }
      })
      .join("/");
    return u.toString();
  } catch {
    // Relative/parse edilemeyen URL -> kaba ama güvenli fallback.
    try {
      return encodeURI(url);
    } catch {
      return url;
    }
  }
}
