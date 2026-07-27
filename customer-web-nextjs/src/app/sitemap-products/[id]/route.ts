import { SITE_URL } from "@/lib/seo";
import {
  CHUNK_SIZE,
  chunkCount,
  encodeSlug,
  escapeXml,
  fetchSitemapProducts,
} from "@/lib/sitemap-products";

// Saatlik yenilenir; soguk istek disinda CDN/Next cache'inden servis edilir.
export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = Number.parseInt(id.replace(/\.xml$/, ""), 10);

  const products = await fetchSitemapProducts();
  if (!Number.isInteger(index) || index < 0 || index >= chunkCount(products.length)) {
    return new Response("Not found", { status: 404 });
  }

  const slice = products.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);

  const urls = slice
    .map((product) => {
      const slug = encodeSlug(product.slug);
      // Cevirisi olmayan urun icin /en/ uretilmez — o sayfa zaten /tr/'ye
      // 308 ile yonleniyor (bkz. urun/[slug]/page.tsx).
      const alternates = product.locales
        .map(
          (locale) =>
            `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(
              `${SITE_URL}/${locale}/urun/${slug}`
            )}" />`
        )
        .join("\n");

      return product.locales
        .map((locale) =>
          [
            "  <url>",
            `    <loc>${escapeXml(`${SITE_URL}/${locale}/urun/${slug}`)}</loc>`,
            alternates,
            product.updatedAt ? `    <lastmod>${product.updatedAt}</lastmod>` : "",
            "    <changefreq>daily</changefreq>",
            "    <priority>0.8</priority>",
            "  </url>",
          ]
            .filter(Boolean)
            .join("\n")
        )
        .join("\n");
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
