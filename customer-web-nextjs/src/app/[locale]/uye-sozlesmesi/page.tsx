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
  const data = await getPageContent("uye-sozlesmesi", locale);

  return {
    title: data?.meta_title || "Üye Sözleşmesi",
    description:
      data?.meta_description ||
      "Sportoonline üye sözleşmesi ve mesafeli satış koşulları",
    alternates: {
      canonical: `/${locale}/uye-sozlesmesi`,
      languages: {
        tr: `/tr/uye-sozlesmesi`,
        en: `/en/uye-sozlesmesi`,
      },
    },
  };
}

export default async function MembershipAgreementPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("uye-sozlesmesi", locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <ContentPageClient
      title="Üye Sözleşmesi"
      content={data?.content}
      breadcrumbs={[{ label: t("home"), href: "/" }, { label: "Üye Sözleşmesi" }]}
    />
  );
}
