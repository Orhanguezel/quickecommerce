import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterClient } from "./register-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("register_title"),
    description: t("register_description"),
    alternates: {
      canonical: `/${locale}/kayit`,
      languages: { tr: `/tr/kayit`, en: `/en/kayit` },
    },
  };
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <RegisterClient
      translations={{
        register_title: t("register_title"),
        first_name: t("first_name"),
        last_name: t("last_name"),
        email: t("email"),
        phone: t("phone"),
        password: t("password"),
        confirm_password: t("confirm_password"),
        already_have_account: t("already_have_account"),
        login: commonT("login"),
        register: commonT("register"),
        register_error: t("register_error"),
        loading: commonT("loading"),
        or: t("or"),
        google: t("google"),
        facebook: t("facebook"),
        social_error: t("social_error"),
      }}
    />
  );
}
