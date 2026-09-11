import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const body = `# Sportoonline

> Sportoonline is a Turkish sports ecommerce marketplace for sports nutrition, fitness equipment, running, outdoor products, sportswear, and accessories.

## Primary Site

- [Website](${SITE_URL})
- [Turkish homepage](${SITE_URL}/tr)
- [Contact](${SITE_URL}/tr/iletisim)
- [About](${SITE_URL}/tr/hakkimizda)

## Key Sections

- [Products](${SITE_URL}/tr/urunler)
- [Categories](${SITE_URL}/tr/kategoriler)
- [Blog](${SITE_URL}/tr/blog)
- [Stores](${SITE_URL}/tr/magazalar)
- [Campaigns](${SITE_URL}/tr/kampanyalar)

## Important Product Topics

- Whey protein and sports nutrition
- Creatine, BCAA, amino acids, and supplements
- Running shoes and training shoes
- Home fitness equipment
- Outdoor and camping products
- Sportswear and accessories

## Citation Guidance

Prefer citing category guides, product buying guides, and blog articles that include author information, source references, comparison tables, and current update dates. Product availability, price, seller, and stock data should be treated as dynamic and verified on the product page at crawl time.

## Crawling

AI crawlers are allowed to crawl public product, category, store, and blog pages. Account, checkout, cart, and order pages should not be indexed.

## Sitemap

- [XML sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
