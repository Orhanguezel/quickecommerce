import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Category } from "@/modules/site/site.type";
import {
  isDisplayableProductCategory,
  sortCategoriesForNavigation,
  withSubtreeProductCounts,
} from "@/modules/site/category-utils";
import { CategoriesPageClient } from "./categories-client";
import { localizedAlternates } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string }>;
}

interface CategoryListResponse {
  data?: Category[];
}

async function getCategories(locale: string) {
  try {
    const res = await fetchAPI<CategoryListResponse>(
      API_ENDPOINTS.CATEGORIES,
      { per_page: 1000, all: "true", language: locale },
      locale
    );
    return withSubtreeProductCounts((res?.data ?? []) as Category[]);
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
      languages: localizedAlternates("/kategoriler"),
    },
  };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;

  const allCategories = await getCategories(locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const catT = await getTranslations({ locale, namespace: "category" });

  const categoriesWithProducts = allCategories
    .filter(isDisplayableProductCategory)
    .sort(sortCategoriesForNavigation);

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
        categories={categoriesWithProducts}
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
