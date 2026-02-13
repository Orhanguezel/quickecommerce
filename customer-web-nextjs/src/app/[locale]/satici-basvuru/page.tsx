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
  const commonT = await getTranslations({ locale, namespace: "common" });
  const sellerT = await getTranslations({ locale, namespace: "seller" });

  return (
    <BecomeSellerClient
      content={data?.content}
      translations={{
        home: commonT("home"),
        become_seller: sellerT("become_seller"),
        register_title: sellerT("register_title"),
        register_subtitle: sellerT("register_subtitle"),
        first_name: sellerT("first_name"),
        last_name: sellerT("last_name"),
        email: sellerT("email"),
        phone: sellerT("phone"),
        password: sellerT("password"),
        confirm_password: sellerT("confirm_password"),
        agree_terms: sellerT("agree_terms"),
        agree_required: sellerT("agree_required"),
        password_min: sellerT("password_min"),
        passwords_not_match: sellerT("passwords_not_match"),
        registration_failed: sellerT("registration_failed"),
        generic_error: sellerT("generic_error"),
        create_seller_account: sellerT("create_seller_account"),
        registering: sellerT("registering"),
        already_have_account: sellerT("already_have_account"),
        login: commonT("login"),
        registration_success_title: sellerT("registration_success_title"),
        registration_success_message: sellerT("registration_success_message"),
        benefit_free: sellerT("benefit_free"),
        benefit_reach: sellerT("benefit_reach"),
        benefit_support: sellerT("benefit_support"),
        contact_title: sellerT("contact_title"),
        contact_subtitle: sellerT("contact_subtitle"),
        contact_us: sellerT("contact_us"),
        more_info: sellerT("more_info"),
      }}
    />
  );
}
