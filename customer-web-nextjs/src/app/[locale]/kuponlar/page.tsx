import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { CouponsPageClient } from "./coupons-client";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export interface Coupon {
  id: number;
  coupon_title: string;
  coupon_description: string | null;
  coupon_image_url: string | null;
  coupon_code: string;
  discount_type: string;
  discount: number;
  min_order_value: number;
  max_discount: number;
  start_date: string;
  end_date: string;
}

async function getCoupons(locale: string, page: number) {
  try {
    const res = await fetchAPI<any>(
      API_ENDPOINTS.COUPONS,
      { per_page: 12, page },
      locale
    );
    return {
      coupons: (res?.data ?? []) as Coupon[],
      totalPages: res?.meta?.last_page ?? res?.last_page ?? 1,
    };
  } catch {
    return { coupons: [] as Coupon[], totalPages: 0 };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("coupons_title"),
    description: t("coupons_description"),
    alternates: {
      canonical: `/${locale}/kuponlar`,
      languages: { tr: `/tr/kuponlar`, en: `/en/kuponlar` },
    },
  };
}

export default async function CouponsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const data = await getCoupons(locale, page);
  const t = await getTranslations({ locale, namespace: "common" });
  const couponT = await getTranslations({ locale, namespace: "coupon" });

  return (
    <CouponsPageClient
      coupons={data.coupons}
      totalPages={data.totalPages}
      currentPage={page}
      translations={{
        coupons: couponT("coupons"),
        coupons_subtitle: couponT("coupons_subtitle"),
        code: couponT("code"),
        copy: couponT("copy"),
        copied: couponT("copied"),
        min_order: couponT("min_order"),
        max_discount: couponT("max_discount"),
        valid_until: couponT("valid_until"),
        off: couponT("off"),
        no_coupons: couponT("no_coupons"),
        previous: t("previous"),
        next: t("next"),
        home: t("home"),
        currency: t("currency"),
      }}
    />
  );
}
