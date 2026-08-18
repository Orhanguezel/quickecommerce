import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
    "/*/giris",
    "/*/kayit",
    "/*/sifremi-unuttum",
    "/*/sepet",
    "/*/odeme",
    "/*/siparis-basarili",
    "/*/siparislerim",
    "/*/siparis/",
    "/*/hesabim",
    "/*/favorilerim",
    "/*/adreslerim",
    "/*/cuzdan",
    "/*/destek",
    // Urun sorulari widget'inin ucbirimi. Sayfa icerigi sunucuda basiliyor,
    // bu cagri render icin gerekli degil; Googlebot 14 gunde 4.500 kez cekip
    // tarama butcesi harciyordu.
    "/api/v1/product-query/search-question",
  ];
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "anthropic-ai",
    "PerplexityBot",
    "Google-Extended",
    "Googlebot",
    "CCBot",
    "Applebot-Extended",
    "meta-externalagent",
    "Bingbot",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: privatePaths,
      })),
    ],
    // Index once gelsin: urunler /sitemap-products/N.xml parcalarinda,
    // sadece sitemap.xml verilirse Google urunleri hic gormez.
    sitemap: [`${SITE_URL}/sitemap_index.xml`, `${SITE_URL}/sitemap.xml`],
  };
}
