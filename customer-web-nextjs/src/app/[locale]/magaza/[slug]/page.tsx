import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { StoreDetail } from "@/modules/store/store.type";
import type { Product } from "@/modules/product/product.type";
import { StoreDetailClient } from "./store-detail-client";
import { localizedAlternates, SITE_URL } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
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

interface StoreDetailResponse {
  message?: string;
  messages?: string;
  data: StoreDetail;
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

function parseCoordinate(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const coordinate = typeof value === "number" ? value : Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

async function getStoreDetail(slug: string, locale: string) {
  try {
    const res = await fetchAPI<StoreDetailResponse>(
      `${API_ENDPOINTS.STORE_DETAIL}/${slug}`,
      {},
      locale
    );
    return res?.data ?? null;
  } catch {
    return null;
  }
}

async function getStoreProducts(
  locale: string,
  storeId: number,
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
    per_page: 20,
    page,
    store_id: storeId,
  };
  if (sort) productParams.sort = sort;
  if (minPrice) productParams.min_price = minPrice;
  if (maxPrice) productParams.max_price = maxPrice;
  if (minRating) productParams.min_rating = minRating;
  if (search) productParams.search = search;

  // category_id ve brand_id array params
  const extraParams = new URLSearchParams();
  categoryIds?.forEach((id) => extraParams.append("category_id[]", id));
  brandIds?.forEach((id) => extraParams.append("brand_id[]", id));

  const endpoint = `${API_ENDPOINTS.PRODUCTS}${
    extraParams.toString() ? `?${extraParams.toString()}` : ""
  }`;

  const [productsRes, categoriesRes, brandsRes, attributesRes] =
    await Promise.allSettled([
      fetchAPI<{
        data: Product[];
        meta?: { current_page: number; last_page: number; per_page: number; total: number };
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
      }>(endpoint, productParams, locale),
      fetchAPI<{ data: Category[] }>(
        API_ENDPOINTS.CATEGORIES,
        { per_page: 100, all: "true", language: locale, store_id: storeId },
        locale
      ),
      fetchAPI<{ data: Brand[] }>(
        API_ENDPOINTS.BRANDS,
        { per_page: 100, store_id: storeId },
        locale
      ),
      fetchAPI<ProductAttribute[] | { data: ProductAttribute[] }>(
        API_ENDPOINTS.PRODUCT_ATTRIBUTES,
        { language: locale },
        locale
      ),
    ]);

  const products =
    productsRes.status === "fulfilled"
      ? (productsRes.value?.data ?? [])
      : [];
  const totalPages =
    productsRes.status === "fulfilled"
      ? productsRes.value?.meta?.last_page ?? productsRes.value?.last_page ?? 1
      : 1;
  const totalProducts =
    productsRes.status === "fulfilled"
      ? productsRes.value?.meta?.total ?? productsRes.value?.total ?? 0
      : 0;
  const currentPageFromApi =
    productsRes.status === "fulfilled"
      ? productsRes.value?.meta?.current_page ??
        productsRes.value?.current_page ??
        page
      : page;
  const perPage =
    productsRes.status === "fulfilled"
      ? productsRes.value?.meta?.per_page ?? productsRes.value?.per_page ?? 20
      : 20;

  const categoriesRaw =
    categoriesRes.status === "fulfilled"
      ? (categoriesRes.value?.data ?? [])
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
    brandsRes.status === "fulfilled" ? (brandsRes.value?.data ?? []) : [];
  const attributesRaw =
    attributesRes.status === "fulfilled" ? attributesRes.value : [];
  const attributes = (
    Array.isArray(attributesRaw)
      ? attributesRaw
      : ((attributesRaw as { data?: ProductAttribute[] })?.data ?? [])
  ) as ProductAttribute[];

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const store = await getStoreDetail(slug, locale);
  const t = await getTranslations({ locale, namespace: "seo" });

  if (!store) {
    return { title: "Store Not Found" };
  }

  const title = store.meta_title || t("store_title", { name: store.name });
  const description =
    store.meta_description || t("store_description", { name: store.name });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
      ...(store.meta_image_url ? { images: [{ url: store.meta_image_url }] } : {}),
      ...(store.logo_url ? { images: [{ url: store.logo_url }] } : {}),
    },
    alternates: {
      canonical: `/${locale}/magaza/${slug}`,
      languages: localizedAlternates(`/magaza/${slug}`),
    },
  };
}

export default async function StoreDetailPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const store = await getStoreDetail(slug, locale);

  if (!store) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "common" });
  const storeT = await getTranslations({ locale, namespace: "store" });
  const productT = await getTranslations({ locale, namespace: "product" });
  const productsT = await getTranslations({ locale, namespace: "products_page" });
  const latitude = parseCoordinate(store.latitude);
  const longitude = parseCoordinate(store.longitude);

  // Filter/sort/search parametreleri
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

  const productsData = await getStoreProducts(
    locale,
    store.id,
    page,
    sort,
    categoryIds,
    brandIds,
    sp.min_price,
    sp.max_price,
    sp.min_rating,
    sp.search
  );

  const from =
    productsData.totalProducts === 0
      ? 0
      : (productsData.currentPage - 1) * productsData.perPage + 1;
  const to = Math.min(
    productsData.currentPage * productsData.perPage,
    productsData.totalProducts
  );

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
        name: storeT("stores"),
        item: `https://sportoonline.com/${locale}/magazalar`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: store.name,
      },
    ],
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    ...(store.description ? { description: store.description } : {}),
    ...(store.logo_url ? { image: store.logo_url } : {}),
    ...(store.phone ? { telephone: store.phone } : {}),
    ...(store.email ? { email: store.email } : {}),
    ...(store.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: store.address,
            addressCountry: "TR",
          },
        }
      : {}),
    ...(latitude !== null && longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude,
            longitude,
          },
        }
      : {}),
    ...(store.opening_time && store.closing_time
      ? {
          openingHours: `Mo-Su ${store.opening_time}-${store.closing_time}`,
        }
      : {}),
    ...(store.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: store.rating,
            bestRating: 5,
          },
        }
      : {}),
    url: `${SITE_URL}/${locale}/magaza/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <StoreDetailClient
        store={store}
        slug={slug}
        locale={locale}
        products={productsData.products}
        totalPages={productsData.totalPages}
        totalProducts={productsData.totalProducts}
        currentPage={productsData.currentPage}
        perPage={productsData.perPage}
        currentSort={sort}
        currentFilters={{
          category_id: categoryIds,
          brand_id: brandIds,
          min_price: sp.min_price,
          max_price: sp.max_price,
          min_rating: sp.min_rating,
          sort,
        }}
        currentSearch={sp.search}
        categories={productsData.categories}
        brands={productsData.brands.map((b) => ({ id: b.id, name: b.label }))}
        attributes={productsData.attributes.map((a) => ({
          id: a.id,
          label: a.label,
          values:
            a.attribute_values?.map((v) => ({ id: v.value, label: v.label })) ??
            [],
        }))}
        translations={{
          stores: storeT("stores"),
          details: storeT("details"),
          all_products: storeT("all_products"),
          featured_products: storeT("featured_products"),
          products: t("products"),
          delivery_time: storeT("delivery_time"),
          delivery_time_min: storeT("delivery_time_min"),
          open_hours: storeT("open_hours"),
          closed_day: storeT("closed_day"),
          contact: storeT("contact"),
          member_since: storeT("member_since"),
          started_from: storeT("started_from"),
          reviews: storeT("reviews"),
          no_products: storeT("no_products"),
          home: t("home"),
          add_to_cart: productT("add_to_cart"),
          // Filter + sort + pagination
          showing: productsT("showing", {
            from,
            to,
            total: productsData.totalProducts,
          }),
          filter_options: productsT("filter_options"),
          reset_filter: productsT("reset_filter"),
          categories: productsT("categories"),
          brands: productsT("brands"),
          price: productsT("price"),
          min_price: productsT("min_price"),
          max_price: productsT("max_price"),
          rating: productsT("rating"),
          rating_up: productsT("rating_up"),
          apply_filters: productsT("apply_filters"),
          clear_filters: productsT("clear_filters"),
          sort: t("sort"),
          sort_default: t("sort_default"),
          sort_price_asc: t("sort_price_asc"),
          sort_price_desc: t("sort_price_desc"),
          sort_newest: t("sort_newest"),
          sort_popular: t("sort_popular"),
          previous: t("previous"),
          next: t("next"),
          search_placeholder: storeT("search_in_store"),
        }}
      />
    </>
  );
}
