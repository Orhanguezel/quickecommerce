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
  const data = await getPageContent("kvkk-acik-riza", locale);

  return {
    title: data?.meta_title || "KVKK Açık Rıza Beyanı",
    description:
      data?.meta_description ||
      "Sportoonline KVKK kapsamında açık rıza beyanı",
    alternates: {
      canonical: `/${locale}/kvkk-acik-riza`,
      languages: {
        tr: `/tr/kvkk-acik-riza`,
        en: `/en/kvkk-acik-riza`,
      },
    },
  };
}

export default async function KvkkConsentPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("kvkk-acik-riza", locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <ContentPageClient
      title="KVKK Açık Rıza Beyanı"
      content={data?.content}
      breadcrumbs={[
        { label: t("home"), href: "/" },
        { label: "KVKK Açık Rıza Beyanı" },
      ]}
    />
  );
}
