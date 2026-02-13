import type { Metadata } from "next";
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
  const data = await getPageContent("iade-degisim", locale);

  return {
    title: data?.meta_title || t("return_policy_title"),
    description: data?.meta_description || t("return_policy_description"),
    alternates: {
      canonical: `/${locale}/iade-degisim`,
      languages: { tr: `/tr/iade-degisim`, en: `/en/iade-degisim` },
    },
  };
}

export default async function ReturnPolicyPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("iade-degisim", locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const pageT = await getTranslations({ locale, namespace: "pages" });

  return (
    <ContentPageClient
      title={pageT("return_policy")}
      content={data?.content}
      breadcrumbs={[{ label: t("home"), href: "/" }, { label: pageT("return_policy") }]}
    />
  );
}
