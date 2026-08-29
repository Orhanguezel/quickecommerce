import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContentPageClient } from "@/components/common/content-page-client";

/**
 * Puan programi kosullari.
 *
 * Icerik admin panelindeki `sadakat-programi` sayfasindan gelir; oranlar
 * degistiginde metin oradan guncellenir, burada sabit metin TUTULMAZ --
 * kampanya kosullarinin iki ayri yerde birbirinden ayrisma riski olmasin.
 *
 * Bu sayfanin adresi kampanya API'sindeki `terms_url` ile AYNI olmali
 * (CustomerLoyaltyController::publishedTermsUrl). Banner oradan link veriyor.
 */

interface Props {
  params: Promise<{ locale: string }>;
}

const SLUG = "sadakat-programi";
const TITLE = "Puan Programı Koşulları";

async function getPageContent(locale: string) {
  try {
    return await fetchAPI<any>(`${API_ENDPOINTS.PAGES}/${SLUG}`, {}, locale);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const data = await getPageContent(locale);

  return {
    title: data?.meta_title || TITLE,
    description:
      data?.meta_description ||
      "Sportoonline puan programı: değerlendirme yazın, puan kazanın, indirim çekine dönüştürün.",
    alternates: {
      canonical: `/${locale}/puan-programi`,
      languages: { tr: `/tr/puan-programi`, en: `/en/puan-programi` },
    },
  };
}

export default async function LoyaltyTermsPage({ params }: Props) {
  const { locale } = await params;
  const data = await getPageContent(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <ContentPageClient
      title={data?.title || TITLE}
      content={data?.content ?? ""}
      breadcrumbs={[{ label: t("home"), href: "/" }, { label: TITLE }]}
    />
  );
}
