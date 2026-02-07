import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContactPageClient } from "./contact-client";

interface Props {
  params: Promise<{ locale: string }>;
}

async function getSiteInfo(locale: string) {
  try {
    const res = await fetchAPI<any>(API_ENDPOINTS.SITE_GENERAL_INFO, {}, locale);
    return res?.site_settings ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("contact_title"),
    description: t("contact_description"),
    alternates: {
      canonical: `/${locale}/iletisim`,
      languages: { tr: `/tr/iletisim`, en: `/en/iletisim` },
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const siteInfo = await getSiteInfo(locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const pageT = await getTranslations({ locale, namespace: "pages" });

  return (
    <ContactPageClient
      siteInfo={{
        email: siteInfo?.com_site_email ?? null,
        phone: siteInfo?.com_site_contact_number ?? null,
        address: siteInfo?.com_site_full_address ?? null,
      }}
      translations={{
        contact: pageT("contact"),
        contact_subtitle: pageT("contact_subtitle"),
        name: pageT("form_name"),
        email: pageT("form_email"),
        phone: pageT("form_phone"),
        message: pageT("form_message"),
        send: pageT("form_send"),
        success: pageT("form_success"),
        error: pageT("form_error"),
        home: t("home"),
      }}
    />
  );
}
