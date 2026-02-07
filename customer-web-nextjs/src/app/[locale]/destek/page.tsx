import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SupportClient } from "./support-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seoT = await getTranslations({ locale, namespace: "seo" });

  return {
    title: seoT("support_title"),
    robots: { index: false },
    alternates: {
      canonical: `/${locale}/destek`,
      languages: { tr: `/tr/destek`, en: `/en/destek` },
    },
  };
}

export default async function SupportPage({ params }: Props) {
  const { locale } = await params;
  const supportT = await getTranslations({ locale, namespace: "support" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <SupportClient
      translations={{
        support: supportT("support"),
        new_ticket: supportT("new_ticket"),
        ticket_title: supportT("ticket_title"),
        ticket_subject: supportT("ticket_subject"),
        ticket_priority: supportT("ticket_priority"),
        ticket_department: supportT("ticket_department"),
        priority_low: supportT("priority_low"),
        priority_medium: supportT("priority_medium"),
        priority_high: supportT("priority_high"),
        priority_urgent: supportT("priority_urgent"),
        status_open: supportT("status_open"),
        status_closed: supportT("status_closed"),
        no_tickets: supportT("no_tickets"),
        view_conversation: supportT("view_conversation"),
        send_message: supportT("send_message"),
        type_message: supportT("type_message"),
        resolve_ticket: supportT("resolve_ticket"),
        back_to_list: supportT("back_to_list"),
        created: supportT("created"),
        filter_all: supportT("filter_all"),
        home: commonT("home"),
        loading: commonT("loading"),
        error: commonT("error"),
        save: commonT("save"),
        cancel: commonT("cancel"),
        previous: commonT("previous"),
        next: commonT("next"),
        page: commonT("page"),
      }}
    />
  );
}
