import { availableLocales } from "./language";

/**
 * Ic baglantiya aktif locale onekini ekler.
 *
 * NEDEN GEREKLI: routing `localePrefix: "always"` ile yapilandirilmis, yani
 * gecerli tek adres bicimi `/tr/admin/orders`. Sidebar menusu ise href'leri
 * API'den geldigi gibi (`/admin/orders`) veriyordu. Onek olmayan adres
 * **307 ile** dogru adrese yonlendiriliyor; Next istemci yonlendiricisi bunun
 * uzerine ROTA AGACINI BASTAN cekiyor ve `[locale]/admin/layout.tsx` yeniden
 * kuruluyor. Layout'un icindeki sidebar da her sayfa gecisinde sifirdan
 * olusuyor, kaydirma konumu ve acik alt menuler kayboluyordu.
 *
 * Olculen fark (canli): `/admin/orders?_rsc` 7 KB yonlendirme yuku +
 * `/tr/admin/orders?_rsc` 87 KB tam agac; onekli adreste tek istek.
 *
 * Cengel, mutlak URL (http/mailto/tel) ve zaten onekli adresler oldugu gibi
 * birakilir.
 */
export function localeHref(
  href: string | null | undefined,
  locale: string
): string {
  if (!href) return "#";

  // Sayfa ici cengel
  if (href.startsWith("#")) return href;

  // Mutlak URL veya protokol (http:, https:, mailto:, tel: ...)
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return href;

  // Goreli adres — dokunma
  if (!href.startsWith("/")) return href;

  // Zaten locale onekli mi
  const firstSegment = href.split("/")[1];
  if ((availableLocales as readonly string[]).includes(firstSegment)) {
    return href;
  }

  return `/${locale}${href}`;
}
