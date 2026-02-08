import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AboutPageClient } from "./about-client";

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
  const data = await getPageContent("about", locale);

  return {
    title: data?.meta_title || t("about_title"),
    description: data?.meta_description || t("about_description"),
    alternates: {
      canonical: `/${locale}/hakkimizda`,
      languages: { tr: `/tr/hakkimizda`, en: `/en/hakkimizda` },
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent("about", locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const pageT = await getTranslations({ locale, namespace: "pages" });

  return (
    <AboutPageClient
      title={pageT("about")}
      content={data?.content}
      breadcrumbs={[{ label: t("home"), href: "/" }, { label: pageT("about") }]}
    />
  );
}
