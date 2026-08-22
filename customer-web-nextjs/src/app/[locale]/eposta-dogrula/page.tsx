import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { VerifyEmailClient } from "./verify-email-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("verify_email_title"),
    description: t("verify_email_description"),
    // Dogrulama ekrani kisiye ozel; arama motorlarinda yeri yok.
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/${locale}/eposta-dogrula`,
      languages: { tr: `/tr/eposta-dogrula`, en: `/en/eposta-dogrula` },
    },
  };
}

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
