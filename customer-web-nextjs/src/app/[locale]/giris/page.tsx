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
        home: commonT("home"),
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
        or: t("or"),
        google: t("google"),
        facebook: t("facebook"),
        social_error: t("social_error"),
        login_with_otp: t("login_with_otp"),
        otp_title: t("otp_title"),
        otp_subtitle: t("otp_subtitle"),
        otp_code: t("otp_code"),
        send_otp: t("send_otp"),
        resend_otp: t("resend_otp"),
        verify_otp: t("verify_otp"),
        otp_error: t("otp_error"),
        otp_sent: t("otp_sent"),
      }}
    />
  );
}
