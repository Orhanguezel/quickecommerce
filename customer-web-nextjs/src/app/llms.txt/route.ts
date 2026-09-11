import { DEFAULT_ORGANIZATION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * llms.txt — AI sistemleri icin site haritasi.
 *
 * Tanitio SEO katalogu (2026-09-11) K033 bulgulari:
 *   - "Aciklamali giris: 0/10"  → her baglantiya aciklama eklendi
 *   - "Key facts / hakkinda: Yok" → ## Key Facts bolumu eklendi
 *   - "Iletisim: Yok"            → ## Contact bolumu eklendi
 * Format referansi: https://llmstxt.org
 */
export function GET() {
  const org = DEFAULT_ORGANIZATION;
  const address = `${org.address.streetAddress}, ${org.address.addressLocality}, ${org.address.addressRegion}, ${org.address.addressCountry}`;

  const body = `# ${SITE_NAME}

> ${SITE_NAME} is a Turkish sports ecommerce marketplace where multiple verified sellers list sports nutrition, fitness equipment, running gear, outdoor products, sportswear, and accessories. Prices and stock are synced from seller sources daily.

## Key Facts

- Type: multi-seller ecommerce marketplace (B2C), operating in Turkey
- Market: Turkey; site language Turkish (tr); currency Turkish lira (TRY)
- Catalog: sports nutrition, fitness and home gym equipment, running and training footwear, outdoor and camping gear, sportswear, accessories
- Fulfilment: shipped by the listed seller, with order tracking and returns handled through the site
- Online since: 2020 (domain registered 2020-03-03)

## Primary Site

- [Website](${SITE_URL}): entry point, current campaigns and featured products.
- [Turkish homepage](${SITE_URL}/tr): category entry points, flash sales and best sellers.
- [About](${SITE_URL}/tr/hakkimizda): who runs the marketplace and how it operates.
- [Contact](${SITE_URL}/tr/iletisim): address, phone and email for customer and press enquiries.

## Key Sections

- [Products](${SITE_URL}/tr/urunler): full catalog with price, seller and live stock state.
- [Categories](${SITE_URL}/tr/kategoriler): category tree used to navigate the catalog.
- [Blog](${SITE_URL}/tr/blog): training, nutrition and buying guides written for Turkish readers.
- [Stores](${SITE_URL}/tr/magazalar): the sellers listing on the marketplace and their product ranges.
- [Campaigns](${SITE_URL}/tr/kampanyalar): active discounts, flash sales and coupon conditions.
- [Support](${SITE_URL}/tr/destek): order, shipping and return support.
- [Returns and exchange policy](${SITE_URL}/tr/iade-degisim): return window and how refunds are issued.
- [Shipping policy](${SITE_URL}/tr/kargo-politikasi): delivery times, carriers and free-shipping thresholds.

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

## Contact

- Email: ${org.email}
- Address: ${address}
- Contact page: ${SITE_URL}/tr/iletisim
- Profiles: ${org.sameAs.join(", ")}

## Sitemap

- [XML sitemap](${SITE_URL}/sitemap.xml): all indexable product, category, store and blog URLs.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
