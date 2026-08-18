import { SITE_URL } from "@/lib/seo";
import { chunkCount, fetchSitemapProducts } from "@/lib/sitemap-products";

// Urun sayisi degistikce parca sayisi da degisir -> force-static olamaz.
export const revalidate = 3600;

export async function GET() {
  const products = await fetchSitemapProducts();
  const parts = chunkCount(products.length);

  // En yeni urun guncellemesi lastmod olarak kullanilir (uydurma "bugun" degil).
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
