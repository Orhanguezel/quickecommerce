"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCopy, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useBaseService } from "@/modules/core/base.service";
import { eventLabels, useWhatsappStatus, WHATSAPP_API } from "../whatsapp-data";

type Draft = {
  event: string;
  name: string;
  body: string;
  revision: string;
  variables: { label: string; sample: string }[];
};
type MetaTemplate = { id: number; name: string; language: string; category: string; status: string };

const draftsKey = ["whatsapp-drafts"];
const templatesKey = ["whatsapp-templates"];
const statusLabels: Record<string, string> = {
  APPROVED: "Onaylı", PENDING: "İncelemede", REJECTED: "Reddedildi",
  NOT_FOUND: "Meta’da yok", PAUSED: "Duraklatıldı", DISABLED: "Devre dışı",
  IN_APPEAL: "İtiraz incelemesinde", ARCHIVED: "Arşivlendi",
};

function DraftEditor({ draft, onSave, onReload }: {
  draft: Draft;
  onSave: (body: string) => Promise<void>;
  onReload: () => Promise<unknown>;
}) {
  const [body, setBody] = useState(draft.body);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState(false);
  const matches = [...body.matchAll(/\{\{([1-9][0-9]*)\}\}/g)].map(match => Number(match[1]));
  const valid = matches.length === draft.variables.length &&
    matches.every((number, index) => number === index + 1) &&
    !/[{}]/.test(body.replace(/\{\{[1-9][0-9]*\}\}/g, ""));
  const preview = body.replace(/\{\{([1-9][0-9]*)\}\}/g, (token, number) => draft.variables[Number(number) - 1]?.sample ?? token);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{eventLabels[draft.event] ?? draft.event}</CardTitle>
        <CardDescription className="break-all">{draft.name} · Türkçe · UTILITY</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={async event => {
          event.preventDefault();
          if (!valid || busy || conflict) return;
          setBusy(true);
          setNotice("");
          try {
            await onSave(body.trim());
          } catch (error) {
            const response = (error as { response?: { status?: number } }).response;
            setConflict(response?.status === 409);
            setNotice(response?.status === 409
              ? "Taslak başka bir oturumda değişti. Güncel sürümü yükleyin."
              : "Taslak kaydedilemedi. Metni ve bağlantıyı kontrol edin.");
          } finally {
            setBusy(false);
          }
        }}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wa-draft-body">Şablon metni</Label>
            <Textarea id="wa-draft-body" rows={5} maxLength={1024} value={body} required
              aria-invalid={!valid} aria-describedby="wa-draft-variables"
              onChange={event => { setBody(event.target.value); if (!conflict) setNotice(""); }} />
            <div id="wa-draft-variables" className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {draft.variables.map(({ label }, index) => (
                <Badge variant="outline" key={label}>{`{{${index + 1}}}`} {label}</Badge>
              ))}
            </div>
            {!valid && <p role="alert" className="text-sm text-destructive">Numaralı alanları birer kez ve gösterilen sırayla kullanın.</p>}
          </div>
          <section className="flex flex-col gap-2 rounded-lg bg-muted p-4" aria-labelledby="wa-draft-preview">
            <h3 id="wa-draft-preview" className="text-sm font-medium">Önizleme</h3>
            <p className="whitespace-pre-wrap break-words rounded-lg bg-primary/10 p-3 text-sm">{preview}</p>
          </section>
          <div className="flex flex-wrap justify-end gap-2">
            {conflict && <Button type="button" variant="outline" onClick={() => void onReload()}>Güncel taslağı yükle</Button>}
            <Button type="button" variant="outline" disabled={!valid} onClick={async () => {
              try {
                await navigator.clipboard.writeText(body.trim());
                setNotice("Şablon metni kopyalandı.");
              } catch {
                setNotice("Metin kopyalanamadı.");
              }
            }}><ClipboardCopy data-icon="inline-start" /> Metni kopyala</Button>
            <Button type="submit" disabled={busy || conflict || !valid || body.trim() === draft.body}>
              {busy ? "Kaydediliyor…" : "Taslağı kaydet"}
            </Button>
          </div>
          {notice && <p role="status" className="text-sm">{notice}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

export default function WhatsappTemplatesPage() {
  const status = useWhatsappStatus();
  const api = useBaseService<unknown>(WHATSAPP_API).getAxiosInstance();
  const cache = useQueryClient();
  const [selected, setSelected] = useState<string>();
  const [notice, setNotice] = useState("");
  const enabled = !!status.data?.configured;
  const drafts = useQuery({
    queryKey: draftsKey, enabled,
    queryFn: async () => (await api.get<{ data: Draft[] }>(`${WHATSAPP_API}/template-drafts`)).data.data,
  });
  const templates = useQuery({
    queryKey: templatesKey, enabled,
    queryFn: async () => (await api.get<{ data: MetaTemplate[] }>(`${WHATSAPP_API}/templates`)).data.data,
  });
  const sync = useMutation({
    mutationFn: async () => (await api.post<{ data: MetaTemplate[] }>(`${WHATSAPP_API}/templates`)).data.data,
    onSuccess: data => {
      cache.setQueryData(templatesKey, data);
      setNotice("Meta şablonları eşitlendi.");
    },
    onError: () => setNotice("Meta şablonları eşitlenemedi."),
  });

  if (status.isPending) return <p className="rounded-xl border bg-card p-5">Şablonlar yükleniyor…</p>;
  if (!enabled) return <p className="rounded-xl border bg-card p-5">Şablonları yönetmek için Ayarlar sekmesinden hesabı bağlayın.</p>;

  const current = drafts.data?.find(item => item.event === selected) ?? drafts.data?.[0];
  const metaStatus = new Map(templates.data?.filter(item => item.language === "tr").map(item => [item.name, item.status]));
  const managedNames = new Set(drafts.data?.map(item => item.name));
  const otherTemplates = templates.data?.filter(item => !managedNames.has(item.name) || item.language !== "tr");

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Mesaj şablonları</CardTitle>
            <CardDescription>Taslaklar burada saklanır. Gönderimde Meta’nın onayladığı sürüm kullanılır.</CardDescription>
          </div>
          <Button type="button" variant="outline" disabled={sync.isPending} onClick={() => { setNotice(""); sync.mutate(); }}>
            <RefreshCw data-icon="inline-start" /> Meta’dan eşitle
          </Button>
        </CardHeader>
        {(notice || templates.isError) && (
          <CardContent>
            {notice && <p role="status" className="flex items-center gap-2 text-sm"><CheckCircle2 aria-hidden className="size-4" />{notice}</p>}
            {templates.isError && <p role="alert" className="text-sm">Meta durumları yüklenemedi.</p>}
          </CardContent>
        )}
      </Card>
      {drafts.isError && <p role="alert" className="rounded-xl border bg-card p-5">Şablon taslakları yüklenemedi.</p>}
      {drafts.isPending && <p className="rounded-xl border bg-card p-5">Taslaklar yükleniyor…</p>}
      {current && (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
          <Card>
            <CardHeader><CardTitle className="text-base">Sipariş bildirimleri</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-1">
              {drafts.data?.map(item => {
                const provider = metaStatus.get(item.name) ?? (templates.isPending || templates.isError ? "UNKNOWN" : "NOT_FOUND");
                return (
                  <button key={item.event} type="button" aria-pressed={item.event === current.event}
                    className={cn("flex min-w-0 items-center justify-between gap-2 rounded-md px-3 py-3 text-left",
                      item.event === current.event ? "bg-primary/10" : "hover:bg-muted")}
                    onClick={() => { setSelected(item.event); setNotice(""); }}>
                    <span className="text-sm font-medium">{eventLabels[item.event] ?? item.event}</span>
                    <Badge variant={provider === "APPROVED" ? "default" : "outline"} className="shrink-0 whitespace-nowrap">
                      {statusLabels[provider] ?? (provider === "UNKNOWN" ? "Durum yok" : provider)}
                    </Badge>
                  </button>
                );
              })}
              {!!otherTemplates?.length && (
                <details className="mt-2 rounded-md border p-3 text-sm">
                  <summary className="cursor-pointer font-medium">Diğer Meta şablonları ({otherTemplates.length})</summary>
                  <ul className="mt-2 flex flex-col gap-2">
                    {otherTemplates.map(item => <li key={item.id} className="break-all text-muted-foreground">{item.name} · {item.language} · {statusLabels[item.status] ?? item.status}</li>)}
                  </ul>
                </details>
              )}
            </CardContent>
          </Card>
          <DraftEditor key={current.revision + current.event} draft={current}
            onReload={() => drafts.refetch()}
            onSave={async body => {
              const { data } = await api.put<{ data: Draft }>(`${WHATSAPP_API}/template-drafts/${current.event}`, { body, revision: current.revision });
              cache.setQueryData<Draft[]>(draftsKey, previous => previous?.map(item => item.event === current.event ? data.data : item));
              setNotice("Taslak kaydedildi.");
            }} />
        </div>
      )}
    </div>
  );
}
