import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Product, Slider } from "@/modules/product/product.type";
import type { Category } from "@/modules/site/site.type";
import { withSubtreeProductCounts } from "@/modules/site/category-utils";
import type { FlashDeal } from "@/modules/flash-deal/flash-deal.type";
import type { BlogPost } from "@/modules/blog/blog.type";
import { HomePageClient } from "./home-client";
import { absoluteUrl, localizedAlternates, SITE_URL } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "tr" }];
}

interface ListResponse<T> {
  data: T[];
}

interface SliderResponse {
  sliders?: Slider[];
  data?: Slider[];
}

function compactHomeCategory(category: Category): Category {
  return {
    id: Number(category.id),
    value: Number(category.value ?? category.id),
    label: category.label || category.category_name,
    category_name: category.category_name,
    parent_id: category.parent_id === null ? null : Number(category.parent_id),
    category_slug: category.category_slug,
    category_banner: category.category_banner || "",
    category_thumb: category.category_thumb || "",
    category_thumb_url: category.category_thumb_url || "",
    representative_product_image_url: category.representative_product_image_url || null,
    category_name_paths: category.category_name_paths || "",
    parent_path: category.parent_path || "",
    display_order: Number(category.display_order || 0),
    product_count: Number(category.product_count || 0),
    direct_product_count: Number(category.direct_product_count ?? category.product_count ?? 0),
  };
}

function compactHomeProduct(product: Product): Product {
  return {
    id: Number(product.id),
    store_id: product.store_id === null ? null : Number(product.store_id),
    name: product.name,
    slug: product.slug,
    description: "",
    image: "",
    image_url: product.image_url,
    stock: product.stock === null ? null : Number(product.stock),
    price: product.price === null ? null : Number(product.price),
    special_price: product.special_price === null ? null : Number(product.special_price),
    discount_percentage: Number(product.discount_percentage || 0),
    wishlist: Boolean(product.wishlist),
    rating: String(product.rating || "0"),
    review_count: Number(product.review_count || 0),
    flash_sale: product.flash_sale
      ? {
          flash_sale_id: Number(product.flash_sale.flash_sale_id),
          discount_type: product.flash_sale.discount_type,
          discount_amount: Number(product.flash_sale.discount_amount),
          purchase_limit: Number(product.flash_sale.purchase_limit || 0),
        }
      : null,
    is_featured: Boolean(product.is_featured),
    stock_is_exact: Boolean(product.stock_is_exact),
    order_count: Number(product.order_count || 0),
    max_cart_qty: Number(product.max_cart_qty || 99),
    default_variant_id: product.default_variant_id
      ? Number(product.default_variant_id)
      : undefined,
    singleVariant: product.singleVariant?.slice(0, 1).map((variant) => ({
      id: Number(variant.id),
      product_id: Number(variant.product_id),
      variant_slug: variant.variant_slug || "",
      sku: "",
      pack_quantity: Number(variant.pack_quantity || 1),
      attributes: null,
      size: null,
      color: null,
      price: variant.price,
      special_price: variant.special_price,
      stock_quantity: Number(variant.stock_quantity || 0),
      image: null,
      image_url: null,
      status: variant.status || "active",
    })),
    store: product.store
      ? {
          id: Number(product.store.id),
          store_name: product.store.store_name,
          slug: product.store.slug,
        }
      : undefined,
  };
}

const API_URL = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'https://sportoonline.com/api/v1';

async function getSiteSettings(locale: string) {
  try {
    const res = await fetch(`${API_URL}/site-general-info`, {
      headers: { 'X-localization': locale },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.site_settings ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const ss = await getSiteSettings(locale);
  const siteName = ss?.com_site_title || 'Sportoonline';
  const metaTitle = ss?.com_meta_title || `${siteName} — ${t("home_title")}`;
  const metaDesc = ss?.com_meta_description || t("home_description");
  const ogImage = ss?.com_og_image || ss?.com_site_logo || undefined;

  return {
    title: { absolute: metaTitle },
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: "website",
      url: absoluteUrl(`/${locale}`),
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    alternates: {
      canonical: `/${locale}`,
      languages: localizedAlternates("/"),
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
    flashDealsRes,
    flashSaleProductsRes,
    popularRes,
    blogsRes,
  ] = await Promise.allSettled([
    fetchAPI<SliderResponse>(API_ENDPOINTS.SLIDER_LIST, { platform: "web" }, locale),
    fetchAPI<ListResponse<Category>>(API_ENDPOINTS.CATEGORIES, { per_page: 1000, all: "true", language: locale }, locale),
    fetchAPI<ListResponse<Product>>(API_ENDPOINTS.FEATURED_PRODUCTS, { per_page: 6 }, locale),
    fetchAPI<ListResponse<Product>>(API_ENDPOINTS.NEW_ARRIVALS, { per_page: 6 }, locale),
    fetchAPI<ListResponse<Product>>(API_ENDPOINTS.BEST_SELLING, { per_page: 6 }, locale),
    fetchAPI<ListResponse<Product>>(API_ENDPOINTS.TRENDING_PRODUCTS, { per_page: 6 }, locale),
    fetchAPI<ListResponse<FlashDeal>>(API_ENDPOINTS.FLASH_DEALS, {}, locale),
    fetchAPI<ListResponse<Product>>(API_ENDPOINTS.FLASH_DEAL_PRODUCTS, { per_page: 6 }, locale),
    fetchAPI<ListResponse<Product>>(API_ENDPOINTS.POPULAR_PRODUCTS, { per_page: 6 }, locale),
    fetchAPI<ListResponse<BlogPost>>(API_ENDPOINTS.BLOGS, { per_page: 6, page: 1 }, locale),
  ]);

  return {
    sliders: (slidersRes.status === "fulfilled" ? slidersRes.value?.sliders ?? slidersRes.value?.data ?? [] : []) as Slider[],
    categories: withSubtreeProductCounts(
      ((categoriesRes.status === "fulfilled" ? categoriesRes.value?.data ?? [] : []) as Category[])
        .map(compactHomeCategory)
    ).filter((category) => category.parent_id === null),
    featured: ((featuredRes.status === "fulfilled" ? featuredRes.value?.data ?? [] : []) as Product[]).map(compactHomeProduct),
    newArrivals: ((newArrivalsRes.status === "fulfilled" ? newArrivalsRes.value?.data ?? [] : []) as Product[]).map(compactHomeProduct),
    bestSelling: ((bestSellingRes.status === "fulfilled" ? bestSellingRes.value?.data ?? [] : []) as Product[]).map(compactHomeProduct),
    trending: ((trendingRes.status === "fulfilled" ? trendingRes.value?.data ?? [] : []) as Product[]).map(compactHomeProduct),
    flashDeals: (flashDealsRes.status === "fulfilled" ? flashDealsRes.value?.data ?? [] : []) as FlashDeal[],
    topDeals: ((flashSaleProductsRes.status === "fulfilled" ? flashSaleProductsRes.value?.data ?? [] : []) as Product[]).map(compactHomeProduct),
    popular: ((popularRes.status === "fulfilled" ? popularRes.value?.data ?? [] : []) as Product[]).map(compactHomeProduct),
    blogs: (blogsRes.status === "fulfilled" ? blogsRes.value?.data ?? [] : []) as BlogPost[],
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const data = await getHomeData(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const blogT = await getTranslations({ locale, namespace: "blog" });
  const seoT = await getTranslations({ locale, namespace: "seo" });
  const settings = await getSiteSettings(locale);
  const siteName = settings?.com_site_title || 'Sportoonline';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    description: settings?.com_meta_description || seoT("home_description"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${locale}/ara?q={search_term_string}`,
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
          site_h1: settings?.com_meta_title || `${settings?.com_site_title || 'Sportoonline'} — ${settings?.com_site_subtitle || ''}`.trim(),
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
          top_stores_title: t("top_stores_title"),
          newsletter_title: t("newsletter_title"),
          newsletter_subtitle: t("newsletter_subtitle"),
          blog_title: blogT("blog"),
          blog_subtitle: blogT("blog_subtitle"),
          recently_viewed_title: t("recently_viewed_title"),
          recently_viewed_subtitle: t("recently_viewed_subtitle"),
        }}
      />
    </>
  );
}
