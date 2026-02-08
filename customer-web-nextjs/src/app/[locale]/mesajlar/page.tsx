import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChatClient } from "./chat-client";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const chatT = await getTranslations({ locale, namespace: "chat" });

  return {
    title: chatT("messages"),
    robots: { index: false },
  };
}

export default async function ChatPage({ params }: Props) {
  const { locale } = await params;
  const chatT = await getTranslations({ locale, namespace: "chat" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  return (
    <ChatClient
      translations={{
        messages: chatT("messages"),
        stores: chatT("stores"),
        deliverymen: chatT("deliverymen"),
        no_conversations: chatT("no_conversations"),
        type_message: chatT("type_message"),
        send: chatT("send"),
        search_contacts: chatT("search_contacts"),
        select_conversation: chatT("select_conversation"),
        online: chatT("online"),
        attach_file: chatT("attach_file"),
        home: commonT("home"),
        loading: commonT("loading"),
        error: commonT("error"),
        back: commonT("back"),
        search: commonT("search"),
      }}
    />
  );
}
