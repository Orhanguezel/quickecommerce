import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Product } from "@/modules/product/product.type";
import type { Category } from "@/modules/site/site.type";
import { CategoryPageClient } from "./category-client";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

async function findCategoryBySlug(slug: string, locale: string) {
  try {
    const res = await fetchAPI<any>(API_ENDPOINTS.CATEGORIES, { per_page: 200, all: "true" }, locale);
    const categories = (res?.data ?? []) as Category[];
    return categories.find((c) => c.category_slug === slug) ?? null;
  } catch {
    return null;
  }
}

async function getCategoryData(
  slug: string,
  locale: string,
  page: number,
  sort?: string
) {
  const category = await findCategoryBySlug(slug, locale);

  if (!category) {
    return {
      products: [] as Product[],
      totalPages: 0,
      totalProducts: 0,
      categoryName: slug.replace(/-/g, " "),
      subcategories: [] as Category[],
      found: false,
    };
  }

  const [productsRes, subcategoriesRes] = await Promise.allSettled([
    fetchAPI<any>(
      API_ENDPOINTS.PRODUCTS,
      {
        "category_id[]": category.id,
        per_page: 20,
        page,
        ...(sort ? { sort } : {}),
      },
      locale
    ),
    fetchAPI<any>(
      API_ENDPOINTS.CATEGORIES,
      { parent_id: category.id, per_page: 50 },
      locale
    ),
  ]);

  const productsData = productsRes.status === "fulfilled" ? productsRes.value : null;
  const subcategoriesData = subcategoriesRes.status === "fulfilled" ? subcategoriesRes.value : null;

  return {
    products: (productsData?.data ?? []) as Product[],
    totalPages: productsData?.meta?.last_page ?? productsData?.last_page ?? 1,
    totalProducts: productsData?.meta?.total ?? productsData?.total ?? 0,
    categoryName: category.category_name,
    subcategories: (subcategoriesData?.data ?? []) as Category[],
    found: true,
  };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "seo" });
  const data = await getCategoryData(slug, locale, Number(sp.page) || 1);

  const name = data.categoryName;
  const title = t("category_title", { name });
  const description = t("category_description", { name });

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
      canonical: `/${locale}/kategori/${slug}`,
      languages: {
        tr: `/tr/kategori/${slug}`,
        en: `/en/kategori/${slug}`,
      },
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const sort = sp.sort;

  const data = await getCategoryData(slug, locale, page, sort);
  const t = await getTranslations({ locale, namespace: "common" });
  const catT = await getTranslations({ locale, namespace: "category" });

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
        name: data.categoryName,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPageClient
        products={data.products}
        categoryName={data.categoryName}
        categorySlug={slug}
        subcategories={data.subcategories}
        totalPages={data.totalPages}
        totalProducts={data.totalProducts}
        currentPage={page}
        currentSort={sort}
        translations={{
          products: t("products"),
          sort: t("sort"),
          sort_default: t("sort_default"),
          sort_price_asc: t("sort_price_asc"),
          sort_price_desc: t("sort_price_desc"),
          sort_newest: t("sort_newest"),
          sort_popular: t("sort_popular"),
          no_results: t("no_results"),
          page: t("page"),
          previous: t("previous"),
          next: t("next"),
          subcategories: catT("subcategories"),
          home: t("home"),
        }}
      />
    </>
  );
}
