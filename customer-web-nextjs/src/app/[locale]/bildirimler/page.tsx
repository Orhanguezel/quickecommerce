import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationClient } from "./notification-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notification" });

  return {
    title: t("title"),
    robots: { index: false },
    alternates: {
      canonical: `/${locale}/bildirimler`,
      languages: { tr: `/tr/bildirimler`, en: `/en/bildirimler` },
    },
  };
}

export default async function NotificationPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notification" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <NotificationClient
      translations={{
        title: t("title"),
        no_notifications: t("no_notifications"),
        mark_as_read: t("mark_as_read"),
        all: t("all"),
        unread: t("unread"),
        read: t("read"),
        order_notification: t("order_notification"),
        loading: commonT("loading"),
        error: commonT("error"),
        previous: commonT("previous"),
        next: commonT("next"),
        home: commonT("home"),
      }}
    />
  );
}
