"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, MessageSquare, RefreshCw, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
  preview?: string | null;
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
  const chat = useRef<HTMLDivElement>(null);
  const chatTimeline = useRef<HTMLDivElement>(null);

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
  const newest = timeline?.[0]?.id;
  const canRetry = selected?.status === "failed" && !!selected.reason;

  useEffect(() => {
    const panel = chatTimeline.current;
    if (newest && panel) panel.scrollTop = panel.scrollHeight;
  }, [newest]);

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
    <section aria-labelledby="whatsapp-messages-heading" className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-4 sm:px-5">
        <h2 id="whatsapp-messages-heading" className="text-lg font-semibold">Mesajlar</h2>
        <Button type="button" variant="outline" size="sm" className="gap-2" disabled={messages.isFetching}
          onClick={() => { void messages.refetch(); if (selected) void conversation.refetch(); }}>
          <RefreshCw data-icon="inline-start" /> Yenile
        </Button>
      </div>
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)]">
        <div className="flex min-w-0 flex-col gap-2 border-b p-3 md:border-b-0 md:border-r sm:p-4">
          <div className="flex flex-wrap gap-1 pb-2" role="group" aria-label="Mesaj yönü">
            {filters.map(filter => (
              <Button type="button" size="sm" key={filter.value} aria-pressed={direction === filter.value}
                variant={direction === filter.value ? "default" : "outline"}
                onClick={() => { setDirection(filter.value); setPage(1); }}>
                {filter.label}
              </Button>
            ))}
          </div>
          {messages.isPending && <p>Mesajlar yükleniyor…</p>}
          {messages.isError && <p role="alert">Mesajlar yüklenemedi. Gelen kutusu yetkisini kontrol edin.</p>}
          {messages.data?.data.length === 0 && <p>Bu görünümde mesaj yok.</p>}
          <div className="flex max-h-[18rem] flex-col gap-1 overflow-y-auto md:max-h-[32rem]">
            {messages.data?.data.map(message => (
              <button type="button" key={message.id} aria-pressed={selected?.id === message.id}
                className={cn("grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg p-3 text-left",
                  selected?.id === message.id ? "bg-primary/10" : "hover:bg-muted")}
                disabled={action.isPending}
                onClick={() => {
                  if (selected?.id === message.id) return;
                  setSelected(message);
                  setReply("");
                  setNotice("");
                  if (window.matchMedia("(max-width: 767px)").matches) chat.current?.scrollIntoView({ block: "start" });
                }}>
                <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
                  {message.direction === "inbound"
                    ? <ArrowDownLeft aria-hidden className="size-4" />
                    : <ArrowUpRight aria-hidden className="size-4" />}
                </span>
                <span className="grid min-w-0 gap-1">
                  <span className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-2">
                    <span className="font-semibold">{message.recipient_masked}</span>
                    <time className="text-xs tabular-nums text-muted-foreground" dateTime={message.created_at}>
                      {dateFormat.format(new Date(message.created_at))}
                    </time>
                  </span>
                  {message.preview && <span className="truncate text-sm text-muted-foreground">{message.preview}</span>}
                  <span className="text-xs text-muted-foreground">
                    {message.direction === "inbound" ? "Gelen" : "Gönderilen"} · {statuses[message.status] ?? message.status}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {(messages.data?.last_page ?? 1) > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button type="button" className="rounded border p-2" disabled={page === 1} onClick={() => setPage(page - 1)}>Önceki</button>
              <span className="text-sm">{page} / {messages.data?.last_page}</span>
              <button type="button" className="rounded border p-2" disabled={page >= (messages.data?.last_page ?? 1)} onClick={() => setPage(page + 1)}>Sonraki</button>
            </div>
          )}
        </div>
        <div ref={chat} className="flex min-h-52 min-w-0 scroll-mt-20 flex-col gap-3 bg-muted/30 p-4">
          {!selected && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
              <MessageSquare aria-hidden className="size-7" />
              <p>Konuşmayı açmak için bir mesaj seçin.</p>
            </div>
          )}
          {selected && (
            <>
              <h3 className="border-b pb-3 font-semibold">Konuşma · {selected.recipient_masked}</h3>
              {conversation.isPending && <p>Konuşma yükleniyor…</p>}
              {conversation.isError && <p role="alert">Konuşma yüklenemedi.</p>}
              {timeline && (
                <div ref={chatTimeline} className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto py-2">
                  {[...timeline].reverse().map(message => (
                    <article key={message.id} className={cn(
                      "max-w-[90%] whitespace-pre-wrap break-words rounded-xl border px-3 py-2.5 text-sm",
                      message.direction === "inbound" ? "self-start bg-card" : "self-end border-primary/15 bg-primary/10"
                    )}>
                      <div className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <strong>{message.direction === "inbound" ? "Gelen" : "Sportoonline"}</strong>
                        <time dateTime={message.created_at}>{dateFormat.format(new Date(message.created_at))}</time>
                        <Badge variant="outline">{statuses[message.status] ?? message.status}</Badge>
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
                <form className="flex flex-col gap-2 rounded-lg border bg-card p-3"
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
                    <Textarea className="min-h-20 min-w-0" maxLength={4096}
                      disabled={!canSend || action.isPending} value={reply}
                      onChange={event => setReply(event.target.value)} />
                  </label>
                  <Button type="submit" className="self-end gap-2" disabled={!canSend || !reply.trim() || action.isPending}>
                    <Send data-icon="inline-start" /> Mesaj gönder
                  </Button>
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
