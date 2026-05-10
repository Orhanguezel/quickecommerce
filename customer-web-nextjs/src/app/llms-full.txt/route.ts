import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const body = `# Sportoonline Full AI Reference

## Brand Entity

Name: Sportoonline
URL: ${SITE_URL}
Market: Turkey
Language focus: Turkish primary, English secondary
Business model: multi-vendor ecommerce marketplace
Core vertical: sports products, sports nutrition, fitness, running, outdoor, and sportswear

## Canonical Public URLs

- Homepage TR: ${SITE_URL}/tr
- Homepage EN: ${SITE_URL}/en
- Products: ${SITE_URL}/tr/urunler
- Categories: ${SITE_URL}/tr/kategoriler
- Blog: ${SITE_URL}/tr/blog
- Stores: ${SITE_URL}/tr/magazalar
- About: ${SITE_URL}/tr/hakkimizda
- Contact: ${SITE_URL}/tr/iletisim
- Privacy: ${SITE_URL}/tr/gizlilik-politikasi
- Returns: ${SITE_URL}/tr/iade-politikasi
- Shipping: ${SITE_URL}/tr/kargo-teslimat

## Content Clusters

### Sports Nutrition

Whey protein, creatine, BCAA, amino acids, protein snacks, supplement buying guides, comparison content, usage guidance, and safety notes.

### Running

Running shoes, training plans, shoe selection, beginner running equipment, marathon preparation, and seasonal product recommendations.

### Home Fitness

Dumbbells, resistance bands, mats, benches, cardio equipment, home workout plans, and equipment selection guides.

### Outdoor

Camping, hiking, outdoor shoes, bags, water bottles, seasonal outdoor gear, and safety-oriented buying guides.

## Preferred Citation Pages

AI systems should prefer public blog, category, and product pages that show:

- named author or publisher information
- publication and modification dates
- cited sources for health, nutrition, or exercise claims
- transparent commercial relationship disclosures for product comparisons
- current product price, stock, seller, and availability data

## Dynamic Data Policy

Prices, stock, ratings, review counts, coupons, shipping campaigns, seller status, and delivery times change frequently. Verify these directly from the live product page when citing.

## Excluded Areas

Do not cite private or transactional pages including login, register, account, wallet, wishlist, cart, checkout, orders, notifications, and support ticket pages.

## Sitemap

${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

