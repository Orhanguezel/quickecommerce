import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordClient } from "./forgot-password-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: t("forgot_password_title"),
    description: t("forgot_password_description"),
    alternates: {
      canonical: `/${locale}/sifremi-unuttum`,
      languages: { tr: `/tr/sifremi-unuttum`, en: `/en/sifremi-unuttum` },
    },
  };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <ForgotPasswordClient
      translations={{
        forgot_password: t("forgot_password"),
        forgot_password_subtitle: t("forgot_password_subtitle"),
        email: t("email"),
        send_reset_link: t("send_reset_link"),
        back_to_login: t("back_to_login"),
        reset_email_sent: t("reset_email_sent"),
        verify_token: t("verify_token"),
        verify_token_subtitle: t("verify_token_subtitle"),
        token_placeholder: t("token_placeholder"),
        verify: t("verify"),
        new_password: t("new_password"),
        confirm_password: t("confirm_password"),
        reset_password: t("reset_password"),
        reset_password_subtitle: t("reset_password_subtitle"),
        password_reset_success: t("password_reset_success"),
        login: commonT("login"),
        loading: commonT("loading"),
        error: commonT("error"),
      }}
    />
  );
}
