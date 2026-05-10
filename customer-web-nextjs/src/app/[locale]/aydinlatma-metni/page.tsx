import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContentPageClient } from "@/components/common/content-page-client";
import { localizedAlternates } from "@/lib/seo";
import { pageContentOrFallback, policyContent } from "../policy-content";

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
  const data = await getPageContent("aydinlatma-metni", locale);

  return {
    title: data?.meta_title || "Aydınlatma Metni",
    description:
      data?.meta_description ||
      "Sportoonline kişisel veri işleme ve aydınlatma metni",
    alternates: {
      canonical: `/${locale}/aydinlatma-metni`,
      languages: localizedAlternates("/aydinlatma-metni"),
    },
  };
}

export default async function DisclosurePage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("aydinlatma-metni", locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <ContentPageClient
      title="Aydınlatma Metni"
      content={pageContentOrFallback(data?.content, policyContent.disclosureText)}
      breadcrumbs={[{ label: t("home"), href: "/" }, { label: "Aydınlatma Metni" }]}
    />
  );
}
