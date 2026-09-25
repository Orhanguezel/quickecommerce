import type { Metadata } from "next";
import { buildPageTitle, SITE_NAME, localizedAlternates } from "@/lib/seo";
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
  const t = await getTranslations({ locale, namespace: "seo" });
  const data = await getPageContent("iade-degisim", locale);

  return {
    // absolute: DB meta_title marka ekini zaten tasiyor; layout sablonu ikinci kez ekliyordu.
    title: { absolute: buildPageTitle([data?.meta_title, t("return_policy_title")], SITE_NAME) },
    description: data?.meta_description || t("return_policy_description"),
    alternates: {
      canonical: `/${locale}/iade-politikasi`,
      languages: localizedAlternates("/iade-politikasi"),
    },
  };
}

export default async function ReturnPolicyAliasPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("iade-degisim", locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const pageT = await getTranslations({ locale, namespace: "pages" });

  return (
    <ContentPageClient
      title={pageT("return_policy")}
      content={pageContentOrFallback(data?.content, policyContent.returnPolicy)}
      breadcrumbs={[{ label: t("home"), href: "/" }, { label: pageT("return_policy") }]}
    />
  );
}
