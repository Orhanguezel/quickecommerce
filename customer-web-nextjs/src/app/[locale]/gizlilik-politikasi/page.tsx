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
  const data = await getPageContent("privacy", locale);

  return {
    title: data?.meta_title || t("privacy_title"),
    description: data?.meta_description || t("privacy_description"),
    alternates: {
      canonical: `/${locale}/gizlilik-politikasi`,
      languages: { tr: `/tr/gizlilik-politikasi`, en: `/en/gizlilik-politikasi` },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("privacy", locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const pageT = await getTranslations({ locale, namespace: "pages" });

  return (
    <ContentPageClient
      title={pageT("privacy")}
      content={data?.content}
      breadcrumbs={[{ label: t("home"), href: "/" }, { label: pageT("privacy") }]}
    />
  );
}
