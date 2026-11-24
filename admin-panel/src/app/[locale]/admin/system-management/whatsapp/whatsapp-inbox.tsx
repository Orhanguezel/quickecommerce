"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/modules/core/base.service";

type Direction = "inbound" | "outbound";
type Message = {
  id: string;
  direction: Direction;
  recipient_masked: string;
  status: string;
  reason?: string;
  created_at: string;
  content?: { body?: string; text?: { body: string }; type?: string; media_type?: string };
};
type Conversation = {
  data: Message[];
  reply_to: { id: string; expires_at: string; opted_out: boolean } | null;
};

const statuses: Record<string, string> = {
  pending: "Kuyrukta", retry_wait: "Yeniden deneme bekliyor", sending: "Gönderiliyor",
  accepted: "Meta kabul etti", sent: "Gönderildi", delivered: "Teslim edildi",
  read: "Okundu", failed: "Başarısız", unknown: "Sonuç belirsiz",
  suppressed: "Gönderilmedi", received: "Alındı",
};

const dateFormat = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "short", timeStyle: "short",
});

const filters = [
  { value: "all", label: "Tümü" },
  { value: "inbound", label: "Gelen" },
  { value: "outbound", label: "Gönderilen" },
] as const;

export default function WhatsappInbox({ ready }: { ready: boolean }) {
  const api = useBaseService<unknown>("/v1/admin/whatsapp").getAxiosInstance();
  const cache = useQueryClient();
  const [direction, setDirection] = useState<Direction | "all">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");

  const messages = useQuery({
    queryKey: ["whatsapp-messages", direction, page],
    queryFn: async () => (await api.get<{ data: Message[]; last_page: number }>("/v1/admin/whatsapp/messages", {
      params: { page, direction: direction === "all" ? undefined : direction },
    })).data,
    refetchInterval: 15000,
  });
  const conversation = useQuery({
    queryKey: ["whatsapp-conversation", selected?.id],
    enabled: !!selected,
    queryFn: async () => (await api.get<Conversation>(`/v1/admin/whatsapp/conversations/${selected?.id}`)).data,
    refetchInterval: 5000,
  });
  const action = useMutation({
    mutationFn: ({ path, data }: { path: string; data?: FormData | Record<string, unknown> }) =>
      api.post(`/v1/admin/whatsapp/${path}`, data ?? {}),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["whatsapp-messages"] });
      void cache.invalidateQueries({ queryKey: ["whatsapp-conversation"] });
    },
  });

  const target = conversation.data?.reply_to;
  const canSend = ready && !!target && !target.opted_out && Date.parse(target.expires_at) > Date.now();
  const unavailableMessage = !ready ? "WhatsApp bağlantısı gönderime hazır değil."
    : target?.opted_out ? "Bu numara WhatsApp iletişiminden çıkmış."
    : "Müşterinin son mesajından itibaren 24 saat içinde yanıt yazılabilir.";
  const timeline = conversation.data?.data;
  const canRetry = selected?.status === "failed" && !!selected.reason;

  async function download(id: string) {
    try {
      const { data } = await api.get(`/v1/admin/whatsapp/messages/${id}/media`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "whatsapp-attachment";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setNotice("Dosya indirilemedi.");
    }
  }

  return (
    <section aria-labelledby="whatsapp-messages-heading" className="space-y-4 rounded border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="whatsapp-messages-heading" className="text-lg font-medium">Mesajlar</h2>
        <button type="button" className="rounded border px-3 py-2" disabled={messages.isFetching}
          onClick={() => { void messages.refetch(); if (selected) void conversation.refetch(); }}>
          Yenile
        </button>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Mesaj yönü">
        {filters.map(filter => (
          <button type="button" key={filter.value} aria-pressed={direction === filter.value}
            className={`rounded border px-3 py-2 ${direction === filter.value ? "border-blue-700 font-semibold" : ""}`}
            onClick={() => { setDirection(filter.value); setPage(1); }}>
            {filter.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div className="min-w-0 space-y-2">
          {messages.isPending && <p>Mesajlar yükleniyor…</p>}
          {messages.isError && <p role="alert">Mesajlar yüklenemedi. Gelen kutusu yetkisini kontrol edin.</p>}
          {messages.data?.data.length === 0 && <p>Bu görünümde mesaj yok.</p>}
          {messages.data?.data.map(message => (
            <button type="button" key={message.id} aria-pressed={selected?.id === message.id}
              className={`block w-full rounded border p-3 text-left ${selected?.id === message.id ? "border-blue-700" : ""}`}
              disabled={action.isPending}
              onClick={() => {
                if (selected?.id === message.id) return;
                setSelected(message);
                setReply("");
                setNotice("");
              }}>
              <span className="block font-medium">{message.recipient_masked}</span>
              <span className="block text-sm">
                {message.direction === "inbound" ? "Gelen" : "Gönderilen"} · {statuses[message.status] ?? message.status}
              </span>
              <time className="text-xs text-gray-500" dateTime={message.created_at}>
                {dateFormat.format(new Date(message.created_at))}
              </time>
            </button>
          ))}
          {(messages.data?.last_page ?? 1) > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button type="button" className="rounded border p-2" disabled={page === 1} onClick={() => setPage(page - 1)}>Önceki</button>
              <span className="text-sm">{page} / {messages.data?.last_page}</span>
              <button type="button" className="rounded border p-2" disabled={page >= (messages.data?.last_page ?? 1)} onClick={() => setPage(page + 1)}>Sonraki</button>
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-3 rounded border p-3">
          {!selected && <p>Konuşmayı açmak için bir mesaj seçin.</p>}
          {selected && (
            <>
              <h3 className="font-medium">Konuşma · {selected.recipient_masked}</h3>
              {conversation.isPending && <p>Konuşma yükleniyor…</p>}
              {conversation.isError && <p role="alert">Konuşma yüklenemedi.</p>}
              {timeline && (
                <div className="max-h-[28rem] space-y-2 overflow-auto">
                  {[...timeline].reverse().map(message => (
                    <article key={message.id} className={`break-words whitespace-pre-wrap rounded p-2 text-gray-900 ${message.direction === "inbound" ? "bg-gray-100" : "bg-blue-50"}`}>
                      <div className="flex flex-wrap gap-x-2 text-xs">
                        <strong>{message.direction === "inbound" ? "Gelen" : "Sportoonline"}</strong>
                        <time dateTime={message.created_at}>{dateFormat.format(new Date(message.created_at))}</time>
                        <span>{statuses[message.status] ?? message.status}</span>
                      </div>
                      <p>{message.content?.text?.body ?? message.content?.body ?? "Ek veya şablon mesajı"}</p>
                      {message.direction === "inbound" && ["image", "document"].includes(message.content?.type ?? "") && (
                        <button type="button" className="underline" onClick={() => void download(message.id)}>Dosyayı indir</button>
                      )}
                    </article>
                  ))}
                </div>
              )}
              {timeline && (
                <form className="space-y-2"
                  onSubmit={event => {
                    event.preventDefault();
                    const body = reply.trim();
                    if (!target || !canSend || !body || action.isPending) return;
                    setNotice("");
                    action.mutate({ path: `conversations/${target.id}/reply`, data: { body, request_id: crypto.randomUUID() } }, {
                      onSuccess: () => { setReply(""); setNotice("Yanıt gönderim kuyruğuna alındı."); },
                      onError: () => setNotice("Yanıt gönderilemedi. Bağlantıyı ve yanıt süresini kontrol edin."),
                    });
                  }}>
                  <label className="grid gap-1">Mesaj yaz
                    <textarea className="min-h-20 rounded border p-2" maxLength={4096}
                      disabled={!canSend || action.isPending} value={reply}
                      onChange={event => setReply(event.target.value)} />
                  </label>
                  <button type="submit" className="rounded bg-blue-700 px-3 py-2 text-white disabled:opacity-50"
                    disabled={!canSend || !reply.trim() || action.isPending}>Mesaj gönder</button>
                  {!canSend && (
                    <p className="text-sm">{unavailableMessage}</p>
                  )}
                </form>
              )}
              {canSend && target && (
                <form className="flex flex-wrap items-end gap-2" onSubmit={event => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const data = new FormData(form) as FormData & { multipart: boolean };
                  data.append("request_id", crypto.randomUUID());
                  data.multipart = true;
                  action.mutate({ path: `conversations/${target.id}/media`, data }, {
                    onSuccess: () => { form.reset(); setNotice("Dosya gönderim kuyruğuna alındı."); },
                    onError: () => setNotice("Dosya gönderilemedi."),
                  });
                }}>
                  <label className="grid min-w-0 gap-1 text-sm">Dosya (JPEG, PNG veya PDF, en fazla 5 MB)
                    <input className="min-w-0 max-w-full" name="file" type="file" accept="image/jpeg,image/png,application/pdf" required />
                  </label>
                  <button type="submit" className="rounded border p-2" disabled={action.isPending}>Dosyayı gönder</button>
                </form>
              )}
              <div className="flex flex-wrap gap-2">
                {target && (
                  <button type="button" className="rounded border p-2" disabled={action.isPending}
                    onClick={() => action.mutate({ path: `messages/${target.id}/read` }, {
                      onSuccess: () => setNotice("Okundu bilgisi gönderildi."),
                      onError: () => setNotice("Okundu bilgisi gönderilemedi."),
                    })}>Okundu bilgisi gönder</button>
                )}
                {canRetry && (
                  <button type="button" className="rounded border p-2" disabled={action.isPending}
                    onClick={() => action.mutate({ path: `messages/${selected.id}/retry` }, {
                      onSuccess: () => setNotice("Mesaj yeniden gönderim kuyruğuna alındı."),
                      onError: () => setNotice("Bu mesaj yeniden gönderilemiyor."),
                    })}>Geçici hatada yeniden dene</button>
                )}
              </div>
            </>
          )}
          {notice && <p role="status">{notice}</p>}
        </div>
      </div>
    </section>
  );
}
