import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Product } from "@/modules/product/product.type";
import type { Category } from "@/modules/site/site.type";
import {
  isDisplayableProductCategory,
  sortCategoriesForNavigation,
} from "@/modules/site/category-utils";
import { CategoryPageClient } from "./category-client";
import { absoluteUrl, localizedAlternates, SITE_URL } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    brand_id?: string | string[];
    category_id?: string | string[];
    store_id?: string | string[];
    min_price?: string;
    max_price?: string;
    min_rating?: string;
    has_discount?: string;
  }>;
}

interface Brand {
  id: number;
  value: number;
  label: string;
  slug: string;
}

function decodeCategorySlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function getChildren(categories: Category[], parentId: number) {
  return categories.filter((category) => Number(category.parent_id) === Number(parentId));
}

function getDisplayableDescendants(categories: Category[], parentId: number): Category[] {
  return getChildren(categories, parentId)
    .sort(sortCategoriesForNavigation)
    .flatMap((child) =>
      isDisplayableProductCategory(child)
        ? [child]
        : getDisplayableDescendants(categories, child.id)
    );
}

async function findCategoryContext(slug: string, locale: string) {
  const decodedSlug = decodeCategorySlug(slug);
  try {
    const res = await fetchAPI<any>(
      API_ENDPOINTS.CATEGORIES,
      { per_page: 500, all: "true", language: locale },
      locale
    );
    const categories = (res?.data ?? []) as Category[];
    return {
      category: categories.find((c) => c.category_slug === decodedSlug) ?? null,
      categories,
    };
  } catch {
    return { category: null, categories: [] as Category[] };
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
  const { category, categories } = await findCategoryContext(slug, locale);

  if (!category) {
    const decodedSlug = decodeCategorySlug(slug);
    return {
      products: [] as Product[],
      totalPages: 0,
      totalProducts: 0,
      currentPage: page,
      perPage: 20,
      categoryName: decodedSlug.replace(/-/g, " "),
      subcategories: [] as Category[],
      brands: [] as Brand[],
      stores: [] as { id: number; name: string }[],
      filterCategoryIds: [] as string[],
      found: false,
    };
  }

  const extraParams = new URLSearchParams();
  const defaultCategoryIds = isDisplayableProductCategory(category)
    ? [String(category.id)]
    : getDisplayableDescendants(categories, category.id).map((item) => String(item.id));
  const filterCategoryIds =
    categoryIds && categoryIds.length > 0
      ? categoryIds
      : defaultCategoryIds.length > 0
        ? defaultCategoryIds
        : [String(category.id)];

  if (categoryIds && categoryIds.length > 0) {
    categoryIds.forEach((id) => extraParams.append("category_id[]", id));
  }
  if (!categoryIds || categoryIds.length === 0) {
    filterCategoryIds.forEach((id) => extraParams.append("category_id[]", id));
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

  const [productsRes, brandsRes, storesRes] =
    await Promise.allSettled([
      fetchAPI<any>(
        `${API_ENDPOINTS.PRODUCTS}?${extraParams.toString()}`,
        productParams,
        locale
      ),
      fetchAPI<any>(API_ENDPOINTS.BRANDS, { per_page: 100 }, locale),
      fetchAPI<any>(API_ENDPOINTS.STORES, { per_page: 100 }, locale),
    ]);

  const productsData =
    productsRes.status === "fulfilled" ? productsRes.value : null;
  const brandsData =
    brandsRes.status === "fulfilled" ? brandsRes.value : null;
  const storesData =
    storesRes.status === "fulfilled" ? storesRes.value : null;
  const directSubcategories = getChildren(categories, category.id)
    .filter(isDisplayableProductCategory)
    .sort(sortCategoriesForNavigation);
  const subcategories =
    directSubcategories.length > 0
      ? directSubcategories
      : getDisplayableDescendants(categories, category.id);

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
    subcategories,
    brands: (brandsData?.data ?? []) as Brand[],
    stores: (storesData?.data ?? []) as { id: number; name: string }[],
    filterCategoryIds,
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
      url: absoluteUrl(`/${locale}/kategori/${slug}`),
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
    },
    alternates: {
      canonical: `/${locale}/kategori/${slug}`,
      languages: localizedAlternates(`/kategori/${slug}`),
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
  const storeIds = sp.store_id
    ? Array.isArray(sp.store_id)
      ? sp.store_id
      : [sp.store_id]
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
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.categoryName,
    url: `${SITE_URL}/${locale}/kategori/${slug}`,
    description:
      locale === "tr"
        ? `${data.categoryName} kategorisindeki ürünleri, markaları ve fiyat seçeneklerini Sportoonline'da keşfedin.`
        : `Discover products, brands, and price options in the ${data.categoryName} category on Sportoonline.`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.products.length,
      itemListElement: data.products.slice(0, 12).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/${locale}/urun/${product.slug}`,
        name: product.name,
      })),
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name:
          locale === "tr"
            ? `${data.categoryName} ürünleri nasıl seçilir?`
            : `How should ${data.categoryName} products be selected?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "tr"
              ? "Kullanım amacı, beden veya teknik özellikler, marka güvenilirliği, kullanıcı yorumları, fiyat ve stok durumu birlikte değerlendirilmelidir."
              : "Compare intended use, size or technical specifications, brand reliability, customer reviews, price, and availability together.",
        },
      },
      {
        "@type": "Question",
        name:
          locale === "tr"
            ? `${data.categoryName} fiyatları neye göre değişir?`
            : `What affects ${data.categoryName} prices?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            locale === "tr"
              ? "Fiyatlar marka, ürün özellikleri, satıcı, kampanya, stok ve teslimat koşullarına göre değişebilir. Güncel fiyat ürün sayfasında doğrulanmalıdır."
              : "Prices can vary by brand, features, seller, campaign, stock, and delivery terms. Verify the current price on the product page.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <CategoryPageClient
        products={data.products}
        categoryName={data.categoryName}
        categorySlug={slug}
        subcategories={data.subcategories}
        brands={data.brands.map((b) => ({ id: b.id, name: b.label }))}
        stores={data.stores}
        totalPages={data.totalPages}
        totalProducts={data.totalProducts}
        currentPage={data.currentPage}
        perPage={data.perPage}
        filterCategoryIds={data.filterCategoryIds}
        currentSort={sort}
        currentFilters={{
          brand_id: brandIds,
          category_id: categoryIds,
          store_id: storeIds,
          min_price: sp.min_price,
          max_price: sp.max_price,
          min_rating: sp.min_rating,
          has_discount: sp.has_discount,
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
