"use client";

import WhatsappInbox from "./whatsapp-inbox";
import { replyReady, useWhatsappStatus } from "./whatsapp-data";

export default function WhatsappMessagesPage() {
  const query = useWhatsappStatus();

  if (query.isPending) return <p className="rounded-xl border bg-card p-5">Mesajlar yükleniyor…</p>;
  if (query.isError) return <p role="alert" className="rounded-xl border bg-card p-5">WhatsApp hesabı yüklenemedi.</p>;
  if (!query.data.configured) return <p className="rounded-xl border bg-card p-5">Mesajları görmek için Ayarlar sekmesinden hesabı bağlayın.</p>;

  return <WhatsappInbox ready={replyReady(query.data)} />;
}
