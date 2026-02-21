import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Product } from "@/modules/product/product.type";
import type { Category } from "@/modules/site/site.type";
import { CategoryPageClient } from "./category-client";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    brand_id?: string | string[];
    category_id?: string | string[];
    min_price?: string;
    max_price?: string;
    min_rating?: string;
  }>;
}

interface Brand {
  id: number;
  value: number;
  label: string;
  slug: string;
}

async function findCategoryBySlug(slug: string, locale: string) {
  try {
    const res = await fetchAPI<any>(
      API_ENDPOINTS.CATEGORIES,
      { per_page: 200, all: "true", language: locale },
      locale
    );
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
  sort?: string,
  brandIds?: string[],
  categoryIds?: string[],
  minPrice?: string,
  maxPrice?: string,
  minRating?: string
) {
  const category = await findCategoryBySlug(slug, locale);

  if (!category) {
    return {
      products: [] as Product[],
      totalPages: 0,
      totalProducts: 0,
      currentPage: page,
      perPage: 20,
      categoryName: slug.replace(/-/g, " "),
      subcategories: [] as Category[],
      brands: [] as Brand[],
      found: false,
    };
  }

  const extraParams = new URLSearchParams();
  // If subcategories are selected, filter by those; otherwise use the parent category
  if (categoryIds && categoryIds.length > 0) {
    categoryIds.forEach((id) => extraParams.append("category_id[]", id));
  } else {
    extraParams.append("category_id[]", String(category.id));
  }
  brandIds?.forEach((id) => extraParams.append("brand_id[]", id));

  const productParams: Record<string, string | number | boolean> = {
    per_page: 20,
    page,
  };
  if (sort) productParams.sort = sort;
  if (minPrice) productParams.min_price = minPrice;
  if (maxPrice) productParams.max_price = maxPrice;
  if (minRating) productParams.min_rating = minRating;

  const [productsRes, subcategoriesRes, brandsRes] =
    await Promise.allSettled([
      fetchAPI<any>(
        `${API_ENDPOINTS.PRODUCTS}?${extraParams.toString()}`,
        productParams,
        locale
      ),
      fetchAPI<any>(
        API_ENDPOINTS.CATEGORIES,
        { parent_id: category.id, per_page: 50, has_products: true, language: locale },
        locale
      ),
      fetchAPI<any>(API_ENDPOINTS.BRANDS, { per_page: 100 }, locale),
    ]);

  const productsData =
    productsRes.status === "fulfilled" ? productsRes.value : null;
  const subcategoriesData =
    subcategoriesRes.status === "fulfilled" ? subcategoriesRes.value : null;
  const brandsData =
    brandsRes.status === "fulfilled" ? brandsRes.value : null;

  return {
    products: (productsData?.data ?? []) as Product[],
    totalPages:
      productsData?.meta?.last_page ?? productsData?.last_page ?? 1,
    totalProducts: productsData?.meta?.total ?? productsData?.total ?? 0,
    currentPage:
      productsData?.meta?.current_page ??
      productsData?.current_page ??
      page,
    perPage:
      productsData?.meta?.per_page ?? productsData?.per_page ?? 20,
    categoryName: category.category_name,
    subcategories: (subcategoriesData?.data ?? []) as Category[],
    brands: (brandsData?.data ?? []) as Brand[],
    found: true,
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
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
  const brandIds = sp.brand_id
    ? Array.isArray(sp.brand_id)
      ? sp.brand_id
      : [sp.brand_id]
    : undefined;
  const categoryIds = sp.category_id
    ? Array.isArray(sp.category_id)
      ? sp.category_id
      : [sp.category_id]
    : undefined;

  const data = await getCategoryData(
    slug,
    locale,
    page,
    sort,
    brandIds,
    categoryIds,
    sp.min_price,
    sp.max_price,
    sp.min_rating
  );

  const t = await getTranslations({ locale, namespace: "common" });
  const catT = await getTranslations({ locale, namespace: "category" });
  const filterT = await getTranslations({
    locale,
    namespace: "products_page",
  });

  const from =
    data.totalProducts === 0
      ? 0
      : (data.currentPage - 1) * data.perPage + 1;
  const to = Math.min(data.currentPage * data.perPage, data.totalProducts);

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
        brands={data.brands.map((b) => ({ id: b.id, name: b.label }))}
        totalPages={data.totalPages}
        totalProducts={data.totalProducts}
        currentPage={data.currentPage}
        perPage={data.perPage}
        currentSort={sort}
        currentFilters={{
          brand_id: brandIds,
          category_id: categoryIds,
          min_price: sp.min_price,
          max_price: sp.max_price,
          min_rating: sp.min_rating,
          sort,
        }}
        translations={{
          products: t("products"),
          showing: filterT("showing", {
            from,
            to,
            total: data.totalProducts,
          }),
          sort: t("sort"),
          sort_default: t("sort_default"),
          sort_price_asc: t("sort_price_asc"),
          sort_price_desc: t("sort_price_desc"),
          sort_newest: t("sort_newest"),
          sort_popular: t("sort_popular"),
          no_results: t("no_results"),
          previous: t("previous"),
          next: t("next"),
          subcategories: catT("subcategories"),
          home: t("home"),
          filter_options: filterT("filter_options"),
          reset_filter: filterT("reset_filter"),
          categories: filterT("categories"),
          brands: filterT("brands"),
          price: filterT("price"),
          min_price: filterT("min_price"),
          max_price: filterT("max_price"),
          rating: filterT("rating"),
          rating_up: filterT("rating_up"),
          apply_filters: filterT("apply_filters"),
          clear_filters: filterT("clear_filters"),
        }}
      />
    </>
  );
}
