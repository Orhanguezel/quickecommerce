import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Product } from "@/modules/product/product.type";
import { SearchPageClient } from "./search-client";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}

async function getSearchResults(
  query: string,
  locale: string,
  page: number,
  sort?: string
) {
  if (!query) return { products: [], totalPages: 0, totalProducts: 0 };

  try {
    const res = await fetchAPI<any>(
      API_ENDPOINTS.PRODUCTS,
      {
        search: query,
        per_page: 20,
        page,
        ...(sort ? { sort } : {}),
      },
      locale
    );
    return {
      products: (res?.data ?? []) as Product[],
      totalPages: res?.meta?.last_page ?? res?.last_page ?? 1,
      totalProducts: res?.meta?.total ?? res?.total ?? 0,
    };
  } catch {
    return { products: [], totalPages: 0, totalProducts: 0 };
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "seo" });
  const query = sp.q || "";

  const title = query
    ? t("search_title", { query })
    : t("products_title");
  const description = query
    ? t("search_description", { query })
    : "";

  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/ara${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    },
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const query = sp.q || "";
  const page = Number(sp.page) || 1;
  const sort = sp.sort;

  const data = await getSearchResults(query, locale, page, sort);
  const t = await getTranslations({ locale, namespace: "common" });
  const searchT = await getTranslations({ locale, namespace: "search" });

  return (
    <SearchPageClient
      products={data.products}
      query={query}
      totalPages={data.totalPages}
      totalProducts={data.totalProducts}
      currentPage={page}
      currentSort={sort}
      translations={{
        title: searchT("title"),
        results_for: searchT("results_for"),
        no_results: searchT("no_results"),
        try_different: searchT("try_different"),
        placeholder: searchT("placeholder"),
        products: t("products"),
        sort: t("sort"),
        sort_default: t("sort_default"),
        sort_price_asc: t("sort_price_asc"),
        sort_price_desc: t("sort_price_desc"),
        sort_newest: t("sort_newest"),
        sort_popular: t("sort_popular"),
        previous: t("previous"),
        next: t("next"),
        search: t("search"),
      }}
    />
  );
}
