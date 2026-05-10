import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { fetchAPI } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { ContactPageClient } from "./contact-client";
import { absoluteUrl, cleanContactPhone, DEFAULT_ORGANIZATION, localizedAlternates, SITE_URL } from "@/lib/seo";

interface Props {
  params: Promise<{ locale: string }>;
}

interface ContactSocialLink {
  url: string;
  icon: string;
}

interface ContactPageResponse {
  meta_title?: string;
  meta_description?: string;
  content?: unknown;
}

interface SiteInfoData {
  com_site_title?: string;
  com_site_email?: string;
  com_site_contact_number?: string;
  com_site_full_address?: string;
  com_site_website_url?: string;
}

interface SiteInfoResponse {
  site_settings?: SiteInfoData;
}

interface FooterData {
  com_social_links_facebook_url?: string;
  com_social_links_instagram_url?: string;
  com_social_links_linkedin_url?: string;
  com_social_links_twitter_url?: string;
}

interface FooterResponse {
  data?: {
    content?: FooterData;
  };
}

interface ContactContent {
  contact_form_section?: {
    title?: string;
    subtitle?: string;
  };
  contact_details_section?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    image_url?: string;
    social?: ContactSocialLink[];
  };
  map_section?: {
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
}

function toObjectContent(content: unknown): ContactContent {
  if (!content) return {};
  if (typeof content === "string") {
    try {
      return JSON.parse(content) as ContactContent;
    } catch {
      return {};
    }
  }
  if (typeof content === "object") {
    return content as ContactContent;
  }
  return {};
}

async function getPageContent(slug: string, locale: string) {
  try {
    return await fetchAPI<ContactPageResponse>(`${API_ENDPOINTS.PAGES}/${slug}`, {}, locale);
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

async function getFooterData(locale: string) {
  try {
    const res = await fetchAPI<FooterResponse>(API_ENDPOINTS.FOOTER, {}, locale);
    return res?.data?.content ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const data = await getPageContent("contact", locale);

  return {
    title: data?.meta_title || t("contact_title"),
    description: data?.meta_description || t("contact_description"),
    openGraph: {
      title: data?.meta_title || t("contact_title"),
      description: data?.meta_description || t("contact_description"),
      type: "website",
      url: absoluteUrl(`/${locale}/iletisim`),
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: "Sporto Online",
    },
    alternates: {
      canonical: `/${locale}/iletisim`,
      languages: localizedAlternates("/iletisim"),
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const [pageData, siteInfo, footerData] = await Promise.all([
    getPageContent("contact", locale),
    getSiteInfo(locale),
    getFooterData(locale),
  ]);

  const content = toObjectContent(pageData?.content);
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tPages = await getTranslations({ locale, namespace: "pages" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });
  const sitePhone = cleanContactPhone(siteInfo?.com_site_contact_number);
  const contentPhone = cleanContactPhone(content.contact_details_section?.phone);

  const socialFromPage: ContactSocialLink[] = (content.contact_details_section?.social ?? [])
    .map((item) => ({
      url: item?.url?.trim() || "",
      icon: item?.icon?.trim() || "",
    }))
    .filter((item): item is ContactSocialLink => Boolean(item.url && item.icon));

  const fallbackSocial: ContactSocialLink[] = [
    {
      url: footerData?.com_social_links_facebook_url,
      icon: "Facebook",
    },
    {
      url: footerData?.com_social_links_instagram_url,
      icon: "Instagram",
    },
    {
      url: footerData?.com_social_links_linkedin_url,
      icon: "Linkedin",
    },
    {
      url: footerData?.com_social_links_twitter_url,
      icon: "Twitter",
    },
  ].filter((item): item is ContactSocialLink => Boolean(item.url));

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: tPages("contact"),
    url: `${SITE_URL}/${locale}/iletisim`,
    mainEntity: {
      "@type": "Organization",
      name: DEFAULT_ORGANIZATION.name,
      url: SITE_URL,
      email: siteInfo?.com_site_email || DEFAULT_ORGANIZATION.email,
      ...(sitePhone ? { telephone: sitePhone } : {}),
      address: {
        "@type": "PostalAddress",
        streetAddress:
          siteInfo?.com_site_full_address ||
          DEFAULT_ORGANIZATION.address.streetAddress,
        addressLocality: DEFAULT_ORGANIZATION.address.addressLocality,
        addressRegion: DEFAULT_ORGANIZATION.address.addressRegion,
        postalCode: DEFAULT_ORGANIZATION.address.postalCode,
        addressCountry: DEFAULT_ORGANIZATION.address.addressCountry,
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        ...(sitePhone ? { telephone: sitePhone } : {}),
        email: siteInfo?.com_site_email || DEFAULT_ORGANIZATION.email,
        areaServed: "TR",
        availableLanguage: ["tr", "en"],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactPageClient
        formSection={{
          title: content.contact_form_section?.title || siteInfo?.com_site_title || tPages("contact"),
          subtitle:
            content.contact_form_section?.subtitle ||
            tPages("contact_subtitle"),
        }}
        detailsSection={{
          address: siteInfo?.com_site_full_address || content.contact_details_section?.address || null,
          phone: sitePhone || contentPhone || null,
          email: siteInfo?.com_site_email || content.contact_details_section?.email || null,
          website: siteInfo?.com_site_website_url || content.contact_details_section?.website || null,
          imageUrl: content.contact_details_section?.image_url || null,
          social: socialFromPage.length > 0 ? socialFromPage : fallbackSocial,
        }}
        map={{
          lat: content.map_section?.coordinates?.lat ?? null,
          lng: content.map_section?.coordinates?.lng ?? null,
        }}
        translations={{
          contact: tPages("contact"),
          contact_subtitle: tPages("contact_subtitle"),
          name: tPages("form_name"),
          email: tPages("form_email"),
          phone: tPages("form_phone"),
          message: tPages("form_message"),
          send: tPages("form_send"),
          success: tPages("form_success"),
          error: tPages("form_error"),
          home: tCommon("home"),
          address: tFooter("address"),
          website: tPages("website"),
          social_connect: tFooter("social_connect"),
          name_placeholder: tPages("form_name_placeholder"),
          email_placeholder: tPages("form_email_placeholder"),
          phone_placeholder: tPages("form_phone_placeholder"),
          message_placeholder: tPages("form_message_placeholder"),
          send_message: tPages("form_send_message"),
        }}
      />
    </>
  );
}
