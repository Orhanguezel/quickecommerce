import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Store } from "@/modules/store/store.type";
import { StoreListClient } from "./store-list-client";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getStores(locale: string, page: number) {
  try {
    const res = await fetchAPI<any>(
      API_ENDPOINTS.STORES,
      { per_page: 12, page },
      locale
    );
    return {
      stores: (res?.data ?? []) as Store[],
      totalPages: res?.meta?.last_page ?? res?.last_page ?? 1,
      totalStores: res?.meta?.total ?? res?.total ?? 0,
    };
  } catch {
    return { stores: [] as Store[], totalPages: 0, totalStores: 0 };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  const title = t("stores_title");
  const description = t("stores_description");

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
      canonical: `/${locale}/magazalar`,
      languages: {
        tr: `/tr/magazalar`,
        en: `/en/magazalar`,
      },
    },
  };
}

export default async function StoresPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const data = await getStores(locale, page);
  const t = await getTranslations({ locale, namespace: "common" });
  const storeT = await getTranslations({ locale, namespace: "store" });

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
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <StoreListClient
        stores={data.stores}
        totalPages={data.totalPages}
        totalStores={data.totalStores}
        currentPage={page}
        translations={{
          stores: storeT("stores"),
          store_count: storeT("store_count"),
          featured: storeT("featured"),
          products: t("products"),
          no_results: t("no_results"),
          previous: t("previous"),
          next: t("next"),
          home: t("home"),
          view_store: storeT("view_store"),
          rating: t("sort_rating"),
        }}
      />
    </>
  );
}
