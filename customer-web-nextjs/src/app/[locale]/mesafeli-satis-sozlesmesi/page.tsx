import type { Metadata } from "next";
import { buildPageTitle, localizedAlternates, SITE_NAME } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContentPageClient } from "@/components/common/content-page-client";
import { pageContentOrFallback, policyContent } from "../policy-content";

// Onceden "uye-sozlesmesi" kaydi cekiliyordu ve sayfa Uye Sozlesmesi metnini
// gosteriyordu (2026-09-25). Admin panelde bu slug ile sayfa olusturulana kadar
// policy-content'teki mesafeli satis metni gosterilir.
const DISTANCE_SALES_SLUG = "mesafeli-satis-sozlesmesi";

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
  const data = await getPageContent(DISTANCE_SALES_SLUG, locale);

  return {
    // absolute: DB meta_title marka ekini zaten tasiyor; layout sablonu ikinci kez ekliyordu.
    title: { absolute: buildPageTitle([data?.meta_title, "Mesafeli Satış Sözleşmesi"], SITE_NAME) },
    description:
      data?.meta_description ||
      "Sportoonline mesafeli satış sözleşmesi, cayma hakkı ve teslimat koşulları",
    alternates: {
      canonical: `/${locale}/mesafeli-satis-sozlesmesi`,
      languages: localizedAlternates("/mesafeli-satis-sozlesmesi"),
    },
  };
}

export default async function DistanceSalesAgreementPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent(DISTANCE_SALES_SLUG, locale);
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
