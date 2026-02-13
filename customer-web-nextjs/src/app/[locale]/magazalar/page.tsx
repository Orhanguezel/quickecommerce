import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Store, StoreType } from "@/modules/store/store.type";
import { StoreListClient } from "./store-list-client";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; type?: string }>;
}

async function getStoresData(locale: string, page: number, storeType?: string) {
  const storeParams: Record<string, string | number> = { per_page: 12, page };
  if (storeType) storeParams.store_type = storeType;

  const [storesRes, typesRes] = await Promise.allSettled([
    fetchAPI<any>(API_ENDPOINTS.STORES, storeParams, locale),
    fetchAPI<any>(API_ENDPOINTS.STORE_TYPES, {}, locale),
  ]);

  const storesData = storesRes.status === "fulfilled" ? storesRes.value : null;
  const typesData = typesRes.status === "fulfilled" ? typesRes.value : null;

  return {
    stores: (storesData?.data ?? []) as Store[],
    totalPages: storesData?.meta?.last_page ?? storesData?.last_page ?? 1,
    totalStores: storesData?.meta?.total ?? storesData?.total ?? 0,
    storeTypes: (typesData?.data ?? typesData ?? []) as StoreType[],
  };
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
  const storeType = sp.type;

  const data = await getStoresData(locale, page, storeType);
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
        storeTypes={data.storeTypes}
        currentType={storeType}
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
          select_type: storeT("select_type"),
        }}
      />
    </>
  );
}
