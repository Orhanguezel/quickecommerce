import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContentPageClient } from "@/components/common/content-page-client";
import { pageContentOrFallback, policyContent } from "../policy-content";

interface Props {
  params: Promise<{ locale: string }>;
}

async function getPageContent(slug: string, locale: string) {
  try {
    return await fetchAPI<any>(`${API_ENDPOINTS.PAGES}/${slug}`, {}, locale);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageContent("uye-sozlesmesi", locale);

  return {
    title: data?.meta_title || "Mesafeli Satış Sözleşmesi",
    description:
      data?.meta_description ||
      "Sportoonline mesafeli satış sözleşmesi, cayma hakkı ve teslimat koşulları",
    alternates: {
      canonical: `/${locale}/mesafeli-satis-sozlesmesi`,
      languages: {
        tr: `/tr/mesafeli-satis-sozlesmesi`,
        en: `/en/mesafeli-satis-sozlesmesi`,
      },
    },
  };
}

export default async function DistanceSalesAgreementPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("uye-sozlesmesi", locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <ContentPageClient
      title="Mesafeli Satış Sözleşmesi"
      content={pageContentOrFallback(
        data?.content,
        policyContent.distanceSalesAgreement
      )}
      breadcrumbs={[
        { label: t("home"), href: "/" },
        { label: "Mesafeli Satış Sözleşmesi" },
      ]}
    />
  );
}
