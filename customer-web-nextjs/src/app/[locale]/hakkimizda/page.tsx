import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { AboutPageClient } from "./about-client";
import { absoluteUrl, DEFAULT_ORGANIZATION, localizedAlternates, SITE_URL } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string }>;
}

interface SiteInfoData {
  com_site_email?: string;
  com_site_contact_number?: string;
  com_site_full_address?: string;
}

interface SiteInfoResponse {
  site_settings?: SiteInfoData;
}

async function getPageContent(slug: string, locale: string) {
  try {
    const res = await fetchAPI<any>(`${API_ENDPOINTS.PAGES}/${slug}`, {}, locale);
    return res;
  } catch {
    return null;
  }
}

async function getSiteInfo(locale: string) {
  try {
    const res = await fetchAPI<SiteInfoResponse>(API_ENDPOINTS.SITE_GENERAL_INFO, {}, locale);
    return res?.site_settings ?? null;
  } catch {
    return null;
  }
}

function defaultAboutContent(locale: string) {
  if (locale === "en") {
    return {
      about_section: {
        title: "About Sportoonline",
        subtitle: "A sports marketplace focused on equipment, sports nutrition, running, outdoor and active lifestyle products.",
        description:
          "Sportoonline brings sports products, sellers and customers together in one digital marketplace. The platform focuses on transparent product information, seller visibility, secure shopping flows and practical buying guidance for users who compare sports equipment and nutrition products online.",
      },
      story_section: {
        title: "What We Focus On",
        subtitle: "Clear product discovery, trustworthy seller information and useful category guidance.",
        steps: [
          {
            title: "Marketplace Model",
            subtitle:
              "Sportoonline lists products from multiple sellers so customers can compare alternatives in one place.",
          },
          {
            title: "Sports Categories",
            subtitle:
              "The catalog covers sports nutrition, fitness equipment, running, outdoor, sportswear and accessories.",
          },
          {
            title: "Customer Trust",
            subtitle:
              "Product pages, seller pages, policies and support channels are structured to make purchase decisions clearer.",
          },
        ],
      },
      mission_and_vision_section: {
        title: "Mission and Principles",
        subtitle: "A practical shopping experience for sports users in Turkey.",
        steps: [
          {
            title: "Mission",
            description:
              "To make sports products easier to discover, compare and buy with clear category structures, product data and seller information.",
          },
          {
            title: "Editorial Responsibility",
            description:
              "Buying guides and blog content are intended for information purposes. Health, nutrition and exercise decisions should be evaluated with qualified professionals when needed.",
          },
        ],
      },
    };
  }

  return {
    about_section: {
      title: "Sportoonline Hakkında",
      subtitle:
        "Spor ekipmanları, sporcu besinleri, koşu, outdoor ve aktif yaşam ürünlerine odaklanan çok satıcılı spor pazaryeri.",
      description:
        "Sportoonline, spor ürünlerini, satıcıları ve müşterileri tek bir dijital pazaryerinde buluşturur. Platform; şeffaf ürün bilgisi, görünür satıcı profilleri, güvenli alışveriş akışları ve kullanıcıların spor ekipmanı ile sporcu besini ürünlerini daha bilinçli karşılaştırmasına yardımcı olan kategori rehberlerine odaklanır.",
    },
    story_section: {
      title: "Odak Alanlarımız",
      subtitle:
        "Kolay ürün keşfi, güvenilir satıcı bilgisi ve karar vermeyi kolaylaştıran kategori deneyimi.",
      steps: [
        {
          title: "Pazaryeri Modeli",
          subtitle:
            "Sportoonline, farklı satıcıların ürünlerini tek yerde listeleyerek müşterilerin alternatifleri karşılaştırmasını sağlar.",
        },
        {
          title: "Spor Kategorileri",
          subtitle:
            "Katalog; sporcu besinleri, fitness ekipmanları, koşu, outdoor, spor giyim ve aksesuar kategorilerini kapsar.",
        },
        {
          title: "Müşteri Güveni",
          subtitle:
            "Ürün sayfaları, satıcı profilleri, politika sayfaları ve destek kanalları satın alma kararını daha net hale getirmek için yapılandırılır.",
        },
      ],
    },
    mission_and_vision_section: {
      title: "Misyon ve İlkeler",
      subtitle: "Türkiye'deki spor kullanıcıları için pratik ve güvenilir alışveriş deneyimi.",
      steps: [
        {
          title: "Misyon",
          description:
            "Spor ürünlerinin kategori yapısı, ürün verisi ve satıcı bilgisiyle daha kolay keşfedilmesini, karşılaştırılmasını ve satın alınmasını sağlamak.",
        },
        {
          title: "Editoryal Sorumluluk",
          description:
            "Rehber ve blog içerikleri bilgilendirme amacı taşır. Sağlık, beslenme ve egzersiz kararları gerektiğinde yetkin uzmanlarla birlikte değerlendirilmelidir.",
        },
      ],
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const data = await getPageContent("about", locale);

  return {
    title: data?.meta_title || t("about_title"),
    description: data?.meta_description || t("about_description"),
    openGraph: {
      title: data?.meta_title || t("about_title"),
      description: data?.meta_description || t("about_description"),
      type: "website",
      url: absoluteUrl(`/${locale}/hakkimizda`),
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
    },
    alternates: {
      canonical: `/${locale}/hakkimizda`,
      languages: localizedAlternates("/hakkimizda"),
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const [data, siteInfo] = await Promise.all([
    getPageContent("about", locale),
    getSiteInfo(locale),
  ]);
  const t = await getTranslations({ locale, namespace: "common" });
  const pageT = await getTranslations({ locale, namespace: "pages" });

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: pageT("about"),
    url: `${SITE_URL}/${locale}/hakkimizda`,
    mainEntity: {
      "@type": "Organization",
      name: "Sportoonline",
      url: SITE_URL,
      ...(siteInfo?.com_site_contact_number
        ? {
            telephone: siteInfo.com_site_contact_number,
          }
        : {}),
      ...(siteInfo?.com_site_email
        ? {
            email: siteInfo.com_site_email,
          }
        : {}),
      ...(siteInfo?.com_site_full_address
        ? {
            address: {
              "@type": "PostalAddress",
              streetAddress: siteInfo.com_site_full_address,
              addressLocality: DEFAULT_ORGANIZATION.address.addressLocality,
              addressRegion: DEFAULT_ORGANIZATION.address.addressRegion,
              postalCode: DEFAULT_ORGANIZATION.address.postalCode,
              addressCountry: "TR",
            },
          }
        : {}),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
    <AboutPageClient
      title={pageT("about")}
      content={data?.content || defaultAboutContent(locale)}
      breadcrumbs={[{ label: t("home"), href: "/" }, { label: pageT("about") }]}
    />
    </>
  );
}
