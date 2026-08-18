import { SITE_URL } from "@/lib/seo";
import { chunkCount, fetchSitemapProducts } from "@/lib/sitemap-products";

// Urun sayisi degistikce parca sayisi da degisir.
export const revalidate = 3600;

/**
 * /{locale}/sitemap_index.xml — kok /sitemap_index.xml ile AYNI listeyi verir.
 *
 * Neden ayrica gerekli: Search Console property'si URL-prefix olarak
 * "https://sportoonline.com/tr/" tanimli; o property'ye gonderilen site
 * haritasinin kendisi de /tr/ altinda olmali.
 *
 * Onceki hali /{locale}/sitemap.xml'i listeliyordu, o URL de koke 308 ile
 * yonleniyordu — sitemap index icinde yonlendirme Google'da "getirilemedi"
 * sayilir. Artik alt sitemap'ler dogrudan (redirectsiz) kok dosyalari
 * gosterir; icerdikleri URL'ler zaten /tr/ ile baslar.
 */
export async function GET() {
  const products = await fetchSitemapProducts();
  const parts = chunkCount(products.length);

  const latest =
    products
      .map((product) => product.updatedAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? new Date().toISOString().slice(0, 10);

  const entries = [
    `  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${latest}</lastmod>
  </sitemap>`,
    ...Array.from(
      { length: parts },
      (_, index) => `  <sitemap>
    <loc>${SITE_URL}/sitemap-products/${index}.xml</loc>
    <lastmod>${latest}</lastmod>
  </sitemap>`
    ),
  ].join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
