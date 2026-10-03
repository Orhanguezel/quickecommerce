import type { FlashDeal } from "./flash-deal.type";

// Flash kampanya karti o kampanyanin urunlerine gider: /urunler?flash_sale_id=N.
// Bu URL indekslenmez (urunler sayfasi flash filtresinde noindex + canonical
// /urunler) ve kampanya bitince /kampanyalar'a yonlenir; boylece 2026-09-29
// derin analizindeki "bos kalan indekslenebilir parametreli URL" sorunu
// olusmadan kullanici dogru kampanyaya ulasir. Kartin button_url'si baska bir
// kalici sayfayi (kategori/marka) veya dis siteyi gosteriyorsa o korunur.
export function getFlashDealProductsHref(deal: Pick<FlashDeal, "id" | "button_url">): string {
  const campaignHref = `/urunler?flash_sale_id=${deal.id}`;
  const rawUrl = deal.button_url?.trim();
  if (!rawUrl) return campaignHref;

  let pathWithQuery = rawUrl;
  if (/^https?:\/\//i.test(rawUrl)) {
    try {
      const url = new URL(rawUrl);
      if (url.hostname !== "sportoonline.com" && url.hostname !== "www.sportoonline.com") {
        return rawUrl;
      }
      pathWithQuery = `${url.pathname}${url.search}`;
    } catch {
      return campaignHref;
    }
  }

  const [rawPath, query = ""] = pathWithQuery.split("?");
  const path = rawPath.replace(/^\/(tr|en)(?=\/|$)/, "") || "/";
  if (path === "/" || path === "/ara" || path === "/kampanyalar") return campaignHref;
  if (path === "/urunler") {
    const params = new URLSearchParams(query);
    params.set("flash_sale_id", String(deal.id));
    return `/urunler?${params.toString()}`;
  }
  return pathWithQuery;
}
