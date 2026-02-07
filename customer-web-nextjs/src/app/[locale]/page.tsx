import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Product, Slider } from "@/modules/product/product.type";
import type { Category } from "@/modules/site/site.type";
import { HomePageClient } from "./home-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("home_title"),
    description: t("home_description"),
    openGraph: {
      title: t("home_title"),
      description: t("home_description"),
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        tr: "/tr",
        en: "/en",
      },
    },
  };
}

async function getHomeData(locale: string) {
  const [
    slidersRes,
    categoriesRes,
    featuredRes,
    newArrivalsRes,
    bestSellingRes,
    trendingRes,
    topDealsRes,
    popularRes,
  ] = await Promise.allSettled([
    fetchAPI<any>(API_ENDPOINTS.SLIDER_LIST, { platform: "web" }, locale),
    fetchAPI<any>(API_ENDPOINTS.CATEGORIES, { per_page: 20, all: "false" }, locale),
    fetchAPI<any>(API_ENDPOINTS.FEATURED_PRODUCTS, { per_page: 10 }, locale),
    fetchAPI<any>(API_ENDPOINTS.NEW_ARRIVALS, { per_page: 10 }, locale),
    fetchAPI<any>(API_ENDPOINTS.BEST_SELLING, { per_page: 10 }, locale),
    fetchAPI<any>(API_ENDPOINTS.TRENDING_PRODUCTS, { per_page: 10 }, locale),
    fetchAPI<any>(API_ENDPOINTS.TOP_DEALS, { per_page: 10 }, locale),
    fetchAPI<any>(API_ENDPOINTS.POPULAR_PRODUCTS, { per_page: 10 }, locale),
  ]);

  return {
    sliders: (slidersRes.status === "fulfilled" ? slidersRes.value?.sliders ?? slidersRes.value?.data ?? [] : []) as Slider[],
    categories: (categoriesRes.status === "fulfilled" ? categoriesRes.value?.data ?? [] : []) as Category[],
    featured: (featuredRes.status === "fulfilled" ? featuredRes.value?.data ?? [] : []) as Product[],
    newArrivals: (newArrivalsRes.status === "fulfilled" ? newArrivalsRes.value?.data ?? [] : []) as Product[],
    bestSelling: (bestSellingRes.status === "fulfilled" ? bestSellingRes.value?.data ?? [] : []) as Product[],
    trending: (trendingRes.status === "fulfilled" ? trendingRes.value?.data ?? [] : []) as Product[],
    topDeals: (topDealsRes.status === "fulfilled" ? topDealsRes.value?.data ?? [] : []) as Product[],
    popular: (popularRes.status === "fulfilled" ? popularRes.value?.data ?? [] : []) as Product[],
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const data = await getHomeData(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const seoT = await getTranslations({ locale, namespace: "seo" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sporto Online",
    url: `https://sportoonline.com/${locale}`,
    description: seoT("home_description"),
    potentialAction: {
      "@type": "SearchAction",
      target: `https://sportoonline.com/${locale}/ara?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient
        data={data}
        translations={{
          featured_title: t("featured_title"),
          featured_subtitle: t("featured_subtitle"),
          new_arrivals_title: t("new_arrivals_title"),
          new_arrivals_subtitle: t("new_arrivals_subtitle"),
          best_selling_title: t("best_selling_title"),
          best_selling_subtitle: t("best_selling_subtitle"),
          trending_title: t("trending_title"),
          trending_subtitle: t("trending_subtitle"),
          top_deals_title: t("top_deals_title"),
          top_deals_subtitle: t("top_deals_subtitle"),
          popular_title: t("popular_title"),
          popular_subtitle: t("popular_subtitle"),
          categories_title: t("categories_title"),
          categories_subtitle: t("categories_subtitle"),
        }}
      />
    </>
  );
}
