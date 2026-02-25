import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { ProductDetailResponse } from "@/modules/product/product.type";
import { ProductDetailClient } from "./product-detail-client";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

async function getProductDetail(slug: string, locale: string) {
  try {
    const res = await fetchAPI<ProductDetailResponse>(
      `${API_ENDPOINTS.PRODUCT_DETAIL}/${slug}`,
      {},
      locale
    );
    return res;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await getProductDetail(slug, locale);

  if (!res?.data) {
    const t = await getTranslations({ locale, namespace: "common" });
    return { title: t("no_data") };
  }

  const product = res.data;
  const price = product.special_price
    ? Number(product.special_price)
    : product.price
      ? Number(product.price)
      : null;
  const title = product.meta_title || product.name;
  const description =
    product.meta_description ||
    product.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    "";

  return {
    title,
    description,
    keywords: product.meta_keywords || undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
      images: product.meta_image_url || product.image_url
        ? [{ url: product.meta_image_url || product.image_url, width: 800, height: 800, alt: product.name }]
        : undefined,
    },
    alternates: {
      canonical: `/${locale}/urun/${slug}`,
      languages: {
        tr: `/tr/urun/${slug}`,
        en: `/en/urun/${slug}`,
      },
    },
    other: price
      ? {
          "product:price:amount": String(price),
          "product:price:currency": "TRY",
        }
      : undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const res = await getProductDetail(slug, locale);

  if (!res?.data) {
    notFound();
  }

  const product = res.data;
  const relatedProducts = res.related_products ?? [];
  const t = await getTranslations({ locale, namespace: "product" });

  const price = product.special_price
    ? Number(product.special_price)
    : product.price
      ? Number(product.price)
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, "").slice(0, 500),
    image: product.gallery_images_urls?.length
      ? product.gallery_images_urls
      : [product.image_url],
    sku: product.variants?.[0]?.sku || String(product.id),
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.label }
      : undefined,
    category: product.category?.category_name,
    offers: {
      "@type": "Offer",
      url: `https://sportoonline.com/${locale}/urun/${slug}`,
      priceCurrency: "TRY",
      price: price ?? 0,
      availability:
        product.stock != null && product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: product.store
        ? { "@type": "Organization", name: product.store.name }
        : undefined,
    },
    aggregateRating:
      parseFloat(product.rating) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.review_count,
          }
        : undefined,
    review:
      product.reviews?.length > 0
        ? product.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.reviewed_by?.name || "Anonim" },
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
            },
            reviewBody: r.review,
          }))
        : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "tr" ? "Ana Sayfa" : "Home",
        item: `https://sportoonline.com/${locale}`,
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: product.category.category_name,
              item: `https://sportoonline.com/${locale}/kategori/${product.category.category_slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 3 : 2,
        name: product.name,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        translations={{
          home: t("home"),
          add_to_cart: t("add_to_cart"),
          add_to_wishlist: t("add_to_wishlist"),
          remove_from_wishlist: t("remove_from_wishlist"),
          in_stock: t("in_stock"),
          out_of_stock: t("out_of_stock"),
          quantity: t("quantity"),
          description: t("description"),
          reviews: t("reviews"),
          questions: t("questions"),
          related_products: t("related_products"),
          free_shipping: t("free_shipping"),
          rating: t("rating"),
          specifications: t("specifications"),
          delivery_info: t("delivery_info"),
          return_policy: t("return_policy"),
          seller: t("seller"),
          no_reviews: t("no_reviews"),
          all_products: t("all_products"),
          no_image: t("no_image"),
          sku: t("sku"),
          category: t("category"),
          stock: t("stock"),
          change_of_mind_allowed: t("change_of_mind_allowed"),
          cash_on_delivery: t("cash_on_delivery"),
          available_start_time: t("available_start_time"),
          available_end_time: t("available_end_time"),
          yes: t("yes"),
          no: t("no"),
          options: t("options"),
          visit_store: t("visit_store"),
          buy_now: t("buy_now"),
          share_connect: t("share_connect"),
          days: t("days"),
          cash_on_delivery_note: t("cash_on_delivery_note"),
          free_shipping_note: t("free_shipping_note"),
          questions_coming_soon: t("questions_coming_soon"),
          anonymous: t("anonymous"),
          decrease_quantity: t("decrease_quantity"),
          increase_quantity: t("increase_quantity"),
          facebook: t("facebook"),
          twitter: t("twitter"),
          whatsapp: t("whatsapp"),
          email: t("email"),
          copy_link: t("copy_link"),
        }}
      />
    </>
  );
}
