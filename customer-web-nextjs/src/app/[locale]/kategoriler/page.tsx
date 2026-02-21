import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Category } from "@/modules/site/site.type";
import { CategoriesPageClient } from "./categories-client";

interface Props {
  params: Promise<{ locale: string }>;
}

async function getCategories(locale: string) {
  try {
    const res = await fetchAPI<any>(
      API_ENDPOINTS.CATEGORIES,
      { per_page: 200, all: "true", language: locale },
      locale
    );
    return (res?.data ?? []) as Category[];
  } catch {
    return [] as Category[];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  const title = t("categories_title");
  const description = t("categories_description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
    },
    alternates: {
      canonical: `/${locale}/kategoriler`,
      languages: {
        tr: `/tr/kategoriler`,
        en: `/en/kategoriler`,
      },
    },
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;

  const allCategories = await getCategories(locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const catT = await getTranslations({ locale, namespace: "category" });

  // Build parent categories with children
  const topCategories = allCategories.filter((c) => !c.parent_id);
  const categoriesWithChildren = topCategories
    .map((parent) => ({
      ...parent,
      children: allCategories.filter((c) => c.parent_id === parent.id),
    }))
    // Only show categories that have products directly or in any child
    .filter((cat) => {
      const direct = cat.product_count ?? 0;
      const fromChildren = (cat.children ?? []).reduce(
        (sum, c) => sum + (c.product_count ?? 0),
        0
      );
      return direct + fromChildren > 0;
    });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("home"),
        item: `https://sportoonline.com/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: catT("all_categories"),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoriesPageClient
        categories={categoriesWithChildren}
        translations={{
          home: t("home"),
          all_categories: catT("all_categories"),
          shop_now: catT("shop_now"),
          no_categories: catT("no_categories"),
        }}
      />
    </>
  );
}
