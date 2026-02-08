import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { BecomeSellerClient } from "./become-seller-client";

interface Props {
  params: Promise<{ locale: string }>;
}

async function getPageContent(slug: string, locale: string) {
  try {
    const res = await fetchAPI<any>(`${API_ENDPOINTS.PAGES}/${slug}`, {}, locale);
    return res;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const data = await getPageContent("become-a-seller", locale);

  return {
    title: data?.meta_title || t("become_seller_title") || "Satıcı Ol - Sportoonline",
    description: data?.meta_description || t("become_seller_description") || "Sportoonline'da satıcı olun ve spor ürünlerinizi milyonlarca müşteriye ulaştırın",
    alternates: {
      canonical: `/${locale}/satici-basvuru`,
      languages: { tr: `/tr/satici-basvuru`, en: `/en/satici-basvuru` },
    },
  };
}

export default async function BecomeSellerPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("become-a-seller", locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <BecomeSellerClient
      content={data?.content}
      translations={{
        home: t("home"),
        becomeSeller: t("become_seller") || "Satıcı Ol",
      }}
    />
  );
}
