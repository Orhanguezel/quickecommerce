import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { FlashDeal } from "@/modules/flash-deal/flash-deal.type";
import type { ShippingCampaign } from "@/modules/shipping-campaign/shipping-campaign.type";
import { CampaignsPageClient } from "./campaigns-client";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

interface FlashDealsResponse {
  data?: FlashDeal[];
  meta?: {
    last_page?: number;
  };
  last_page?: number;
}

interface ShippingCampaignsResponse {
  data?: ShippingCampaign[];
}

async function getCampaigns(locale: string, page: number) {
  try {
    const res = await fetchAPI<FlashDealsResponse>(
      API_ENDPOINTS.FLASH_DEALS,
      { per_page: 12, page, language: locale },
      locale
    );

    return {
      campaigns: (res?.data ?? []) as FlashDeal[],
      totalPages: res?.meta?.last_page ?? res?.last_page ?? 1,
    };
  } catch {
    return { campaigns: [] as FlashDeal[], totalPages: 0 };
  }
}

async function getShippingCampaigns(locale: string): Promise<ShippingCampaign[]> {
  try {
    const res = await fetchAPI<ShippingCampaignsResponse>(
      API_ENDPOINTS.SHIPPING_CAMPAIGNS_ACTIVE,
      {},
      locale
    );
    return (res?.data ?? []) as ShippingCampaign[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("campaigns_title"),
    description: t("campaigns_description"),
    alternates: {
      canonical: `/${locale}/kampanyalar`,
      languages: { tr: "/tr/kampanyalar", en: "/en/kampanyalar" },
    },
  };
}

export default async function CampaignsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [data, shippingCampaigns] = await Promise.all([
    getCampaigns(locale, page),
    getShippingCampaigns(locale),
  ]);

  const commonT = await getTranslations({ locale, namespace: "common" });
  const campaignsT = await getTranslations({ locale, namespace: "campaigns" });

  return (
    <CampaignsPageClient
      campaigns={data.campaigns}
      shippingCampaigns={shippingCampaigns}
      currentPage={page}
      totalPages={data.totalPages}
      translations={{
        home: commonT("home"),
        previous: commonT("previous"),
        next: commonT("next"),
        title: campaignsT("title"),
        subtitle: campaignsT("subtitle"),
        no_campaigns: campaignsT("no_campaigns"),
      }}
    />
  );
}
