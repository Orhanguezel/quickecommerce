import type { Metadata } from "next";
import { buildPageTitle, buildMetaDescription } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContentPageClient } from "@/components/common/content-page-client";

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
  const data = await getPageContent("terms", locale);

  // Tanitio (2026-09-12): veritabanindaki meta_title bu sayfalarda 8-19
  // karakterdi ve marka eki eklendiginde bile 30 karakterin altinda kaliyordu;
  // buildPageTitle kisa DB degerini atlayip ceviri basligina duser.
  const pageTitle = buildPageTitle([data?.meta_title, t("terms_title")], "Sportoonline");
  const pageDescription = buildMetaDescription([data?.meta_description, t("terms_description")]);

  return {
    // absolute: buildPageTitle marka ekini kendi ekliyor; layout'taki
    // `%s | ${siteName}` sablonu ikinci kez eklerse baslik 60'i asiyor.
    title: { absolute: pageTitle },
    description: pageDescription,
    alternates: {
      canonical: `/${locale}/kullanim-kosullari`,
      languages: { tr: `/tr/kullanim-kosullari`, en: `/en/kullanim-kosullari` },
    },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("terms", locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const pageT = await getTranslations({ locale, namespace: "pages" });

  return (
    <ContentPageClient
      title={pageT("terms")}
      content={data?.content}
      breadcrumbs={[{ label: t("home"), href: "/" }, { label: pageT("terms") }]}
    />
  );
}
