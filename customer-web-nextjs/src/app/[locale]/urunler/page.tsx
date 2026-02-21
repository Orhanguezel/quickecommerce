import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Product } from "@/modules/product/product.type";
import { ProductsPageClient } from "./products-client";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    category_id?: string | string[];
    brand_id?: string | string[];
    min_price?: string;
    max_price?: string;
    min_rating?: string;
    search?: string;
  }>;
}

interface Brand {
  id: number;
  value: number;
  label: string;
  slug: string;
}

interface Category {
  id: number;
  category_name: string;
  category_slug: string;
  parent_id: number | null;
  product_count?: number;
}

interface ProductAttributeValue {
  value: number;
  label: string;
}

interface ProductAttribute {
  id: number;
  value: number;
  label: string;
  product_type: string;
  attribute_values: ProductAttributeValue[];
}

async function getProductsData(
  locale: string,
  page: number,
  sort?: string,
  categoryIds?: string[],
  brandIds?: string[],
  minPrice?: string,
  maxPrice?: string,
  minRating?: string,
  search?: string
) {
  const productParams: Record<string, string | number | boolean> = {
    per_page: 15,
    page,
  };
  if (sort) productParams.sort = sort;
  if (minPrice) productParams.min_price = minPrice;
  if (maxPrice) productParams.max_price = maxPrice;
  if (minRating) productParams.min_rating = minRating;
  if (search) productParams.search = search;

  // Build category and brand array params
  const extraParams = new URLSearchParams();
  categoryIds?.forEach((id) => extraParams.append("category_id[]", id));
  brandIds?.forEach((id) => extraParams.append("brand_id[]", id));

  const [productsRes, categoriesRes, brandsRes, attributesRes] = await Promise.allSettled([
    fetchAPI<any>(
      `${API_ENDPOINTS.PRODUCTS}${extraParams.toString() ? `?${extraParams.toString()}` : ""}`,
      productParams,
      locale
    ),
    fetchAPI<any>(API_ENDPOINTS.CATEGORIES, { per_page: 100, all: "true", language: locale }, locale),
    fetchAPI<any>(API_ENDPOINTS.BRANDS, { per_page: 100 }, locale),
    fetchAPI<ProductAttribute[]>(API_ENDPOINTS.PRODUCT_ATTRIBUTES, { language: locale }, locale),
  ]);

  const products =
    productsRes.status === "fulfilled"
      ? ((productsRes.value?.data ?? []) as Product[])
      : [];
  const totalPages =
    productsRes.status === "fulfilled"
      ? (productsRes.value?.meta?.last_page ?? productsRes.value?.last_page ?? 1)
      : 1;
  const totalProducts =
    productsRes.status === "fulfilled"
      ? (productsRes.value?.meta?.total ?? productsRes.value?.total ?? 0)
      : 0;
  const currentPageFromApi =
    productsRes.status === "fulfilled"
      ? (productsRes.value?.meta?.current_page ?? productsRes.value?.current_page ?? page)
      : page;
  const perPage =
    productsRes.status === "fulfilled"
      ? (productsRes.value?.meta?.per_page ?? productsRes.value?.per_page ?? 15)
      : 15;

  const categoriesRaw =
    categoriesRes.status === "fulfilled"
      ? ((categoriesRes.value?.data ?? []) as Category[])
      : [];
  const hasProducts = (cat: Category) => Number(cat.product_count || 0) > 0;
  const topCategories = categoriesRaw.filter((cat) => cat.parent_id === null);
  const childCategories = categoriesRaw.filter((cat) => cat.parent_id !== null);

  const categories: Category[] = [];
  for (const parent of topCategories) {
    const children = childCategories.filter(
      (child) => Number(child.parent_id) === Number(parent.id)
    );
    const renderableChildren = children.filter((child) => hasProducts(child));
    if (hasProducts(parent) || renderableChildren.length > 0) {
      categories.push(parent, ...renderableChildren);
    }
  }
  const brands =
    brandsRes.status === "fulfilled"
      ? ((brandsRes.value?.data ?? []) as Brand[])
      : [];
  const attributesRaw = attributesRes.status === "fulfilled" ? attributesRes.value : [];
  const attributes = (Array.isArray(attributesRaw) ? attributesRaw : ((attributesRaw as any)?.data ?? [])) as ProductAttribute[];

  return {
    products,
    totalPages,
    totalProducts,
    currentPage: currentPageFromApi,
    perPage,
    categories,
    brands,
    attributes,
  };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("products_title"),
    description: t("home_description"),
    alternates: {
      canonical: `/${locale}/urunler`,
    },
  };
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;

  const page = Number(sp.page) || 1;
  const sort = sp.sort;
  const categoryIds = sp.category_id
    ? Array.isArray(sp.category_id)
      ? sp.category_id
      : [sp.category_id]
    : undefined;
  const brandIds = sp.brand_id
    ? Array.isArray(sp.brand_id)
      ? sp.brand_id
      : [sp.brand_id]
    : undefined;

  const data = await getProductsData(
    locale,
    page,
    sort,
    categoryIds,
    brandIds,
    sp.min_price,
    sp.max_price,
    sp.min_rating,
    sp.search
  );

  const t = await getTranslations({ locale, namespace: "products_page" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  const from = data.totalProducts === 0 ? 0 : (data.currentPage - 1) * data.perPage + 1;
  const to = Math.min(data.currentPage * data.perPage, data.totalProducts);

  return (
    <ProductsPageClient
      products={data.products}
      totalPages={data.totalPages}
      totalProducts={data.totalProducts}
      currentPage={data.currentPage}
      perPage={data.perPage}
      currentSort={sort}
      currentFilters={{
        category_id: categoryIds,
        brand_id: brandIds,
        min_price: sp.min_price,
        max_price: sp.max_price,
        min_rating: sp.min_rating,
        sort,
      }}
      categories={data.categories}
      brands={data.brands.map((b) => ({ id: b.id, name: b.label }))}
      attributes={data.attributes.map((a) => ({
        id: a.id,
        label: a.label,
        values: a.attribute_values?.map((v) => ({ id: v.value, label: v.label })) ?? [],
      }))}
      translations={{
        title: t("title"),
        showing: t("showing", { from, to, total: data.totalProducts }),
        filter_options: t("filter_options"),
        reset_filter: t("reset_filter"),
        categories: t("categories"),
        brands: t("brands"),
        price: t("price"),
        min_price: t("min_price"),
        max_price: t("max_price"),
        rating: t("rating"),
        rating_up: t("rating_up"),
        apply_filters: t("apply_filters"),
        clear_filters: t("clear_filters"),
        no_products: t("no_products"),
        home: commonT("home"),
        sort: commonT("sort"),
        sort_default: commonT("sort_default"),
        sort_price_asc: commonT("sort_price_asc"),
        sort_price_desc: commonT("sort_price_desc"),
        sort_newest: commonT("sort_newest"),
        sort_popular: commonT("sort_popular"),
        previous: commonT("previous"),
        next: commonT("next"),
      }}
    />
  );
}
