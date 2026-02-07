import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginClient } from "./login-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("login_title"),
    description: t("login_description"),
    alternates: {
      canonical: `/${locale}/giris`,
      languages: { tr: `/tr/giris`, en: `/en/giris` },
    },
  };
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <LoginClient
      translations={{
        login_title: t("login_title"),
        email: t("email"),
        password: t("password"),
        forgot_password: t("forgot_password"),
        dont_have_account: t("dont_have_account"),
        register: commonT("register"),
        login: commonT("login"),
        remember_me: t("remember_me"),
        login_error: t("login_error"),
        loading: commonT("loading"),
      }}
    />
  );
}
