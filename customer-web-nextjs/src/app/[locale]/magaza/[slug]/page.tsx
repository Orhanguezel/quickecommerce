import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { StoreDetail } from "@/modules/store/store.type";
import { StoreDetailClient } from "./store-detail-client";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

interface StoreDetailResponse {
  message?: string;
  messages?: string;
  data: StoreDetail;
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
      languages: {
        tr: `/tr/magaza/${slug}`,
        en: `/en/magaza/${slug}`,
      },
    },
  };
}

export default async function StoreDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const store = await getStoreDetail(slug, locale);

  if (!store) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "common" });
  const storeT = await getTranslations({ locale, namespace: "store" });
  const productT = await getTranslations({ locale, namespace: "product" });

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
          },
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
    url: `https://sportoonline.com/${locale}/magaza/${slug}`,
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
        }}
      />
    </>
  );
}
