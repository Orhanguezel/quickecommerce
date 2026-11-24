"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useBaseService } from "@/modules/core/base.service";
import { eventLabels, useWhatsappStatus, WHATSAPP_API, type WhatsappStatus } from "../whatsapp-data";

const accountFields = [
  { name: "business_account_id", label: "WhatsApp işletme hesabı ID" },
  { name: "phone_number_id", label: "Telefon numarası ID" },
  { name: "access_token", label: "Erişim anahtarı", secret: true },
  { name: "app_secret", label: "Uygulama gizli anahtarı", secret: true },
] as const;

export default function WhatsappSettingsPage() {
  const api = useBaseService<unknown>(WHATSAPP_API).getAxiosInstance();
  const query = useWhatsappStatus();
  const cache = useQueryClient();
  const [notice, setNotice] = useState("");
  const [editPilot, setEditPilot] = useState(false);
  const [pilotEvent, setPilotEvent] = useState("payment_confirmed");
  const [preview, setPreview] = useState("");
  const [previewBusy, setPreviewBusy] = useState(false);

  const mutation = useMutation({
    mutationFn: ({ path, body }: { path: string; body?: Record<string, unknown> }) =>
      api.post<WhatsappStatus>(`${WHATSAPP_API}/${path}`, body ?? {}),
    onSuccess: ({ data }, { path }) => {
      if (path !== "test-send") cache.setQueryData(["whatsapp-status"], data);
      if (path === "connect") {
        for (const key of ["whatsapp-messages", "whatsapp-conversation", "whatsapp-templates", "whatsapp-drafts"]) {
          void cache.invalidateQueries({ queryKey: [key] });
        }
      }
      setNotice(path === "test-send" ? "Test mesajı gönderim kuyruğuna alındı." : "İşlem tamamlandı.");
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      setNotice(error.response?.data?.message || "İşlem tamamlanamadı. Hesap bilgilerini ve yetkinizi kontrol edin."),
  });

  if (query.isPending) return <p className="rounded-xl border bg-card p-5">Ayarlar yükleniyor…</p>;
  if (query.isError) return <p role="alert" className="rounded-xl border bg-card p-5">Ayarlar yüklenemedi. Yönetim yetkisi gereklidir.</p>;

  const status = query.data;
  const connection = status.connection;
  const settingsKey = JSON.stringify(connection && [
    connection.enabled, connection.pilot_mode, connection.enabled_events, connection.out_of_hours_enabled,
    connection.out_of_hours_text, connection.office_start, connection.office_end,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {notice && <p role="status" className="rounded-lg border bg-card p-3 text-sm">{notice}</p>}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hesap ve bağlantı</CardTitle>
          <CardDescription>Sportoonline’a ait Meta hesabını ve webhook bağlantısını yönet.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status.configured && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={connection?.health.connected ? "default" : "outline"}>
                {connection?.health.display_phone_number || "Numara doğrulanıyor"}
              </Badge>
              <Badge variant="outline">{connection?.subscribed ? "Webhook etkin" : "Webhook bekleniyor"}</Badge>
              <span className="break-all text-sm text-muted-foreground">{status.callback_url}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {status.configured && (
              <>
                <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ path: "refresh" })}>Bağlantıyı kontrol et</Button>
                <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ path: "subscribe" })}>Webhook bağlantısını kur</Button>
              </>
            )}
          </div>
          <details open={!status.configured} className="rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">{status.configured ? "Hesap bilgilerini güncelle" : "Hesabı bağla"}</summary>
            <form key={connection?.business_account_id} className="mt-4 flex flex-col gap-4" autoComplete="off" onSubmit={event => {
              event.preventDefault();
              const form = event.currentTarget;
              mutation.mutate({ path: "connect", body: Object.fromEntries(new FormData(form)) }, { onSuccess: () => form.reset() });
            }}>
              <div className="grid gap-4 sm:grid-cols-2">
                {accountFields.map(field => {
                  const secret = "secret" in field;
                  return (
                    <div className="flex min-w-0 flex-col gap-2" key={field.name}>
                      <Label htmlFor={`wa-${field.name}`}>{field.label}</Label>
                      <Input id={`wa-${field.name}`} name={field.name} required type={secret ? "password" : "text"}
                        inputMode={secret ? undefined : "numeric"} autoComplete={secret ? "new-password" : "off"}
                        defaultValue={secret ? undefined : connection?.[field.name as "business_account_id" | "phone_number_id"]} />
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                {status.configured && <p className="text-sm text-muted-foreground">Yeniden bağladığında webhook ve bildirim ayarlarını tekrar kontrol et.</p>}
                <Button type="submit" disabled={mutation.isPending}>Doğrula ve bağla</Button>
              </div>
            </form>
          </details>
        </CardContent>
      </Card>
      {connection && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Otomatik bildirimler</CardTitle>
              <CardDescription>Sipariş olaylarını, pilot alıcıları ve mesai dışı yanıtı yönet.</CardDescription>
            </CardHeader>
            <CardContent>
              <form key={settingsKey} className="flex flex-col gap-4" onSubmit={event => {
                event.preventDefault();
                const fields = new FormData(event.currentTarget);
                mutation.mutate({ path: "settings", body: {
                  enabled: fields.has("enabled"),
                  pilot_mode: fields.has("pilot_mode"),
                  ...(editPilot ? { pilot_numbers: String(fields.get("pilot_numbers") ?? "").split(/[\n,]+/).map(item => item.trim()).filter(Boolean) } : {}),
                  enabled_events: fields.getAll("events"),
                  out_of_hours_enabled: fields.has("out_of_hours_enabled"),
                  out_of_hours_text: fields.get("out_of_hours_text"),
                  office_start: Number(fields.get("office_start")),
                  office_end: Number(fields.get("office_end")),
                } }, { onSuccess: () => setEditPilot(false) });
              }}>
                <Label className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  Bildirimleri etkinleştir
                  <Switch name="enabled" defaultChecked={connection.enabled} />
                </Label>
                <fieldset className="min-w-0 rounded-lg border p-4">
                  <legend className="px-2 text-sm font-medium">Bildirim olayları</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.keys(status.events).map(event => (
                      <Label key={event} className="flex items-center justify-between gap-3 rounded-md bg-muted/50 p-3">
                        {eventLabels[event] ?? event}
                        <Switch name="events" value={event} defaultChecked={connection.enabled_events.includes(event)} />
                      </Label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="flex min-w-0 flex-col gap-3 rounded-lg border p-4">
                  <legend className="px-2 text-sm font-medium">Pilot alıcılar</legend>
                  <Label className="flex items-center justify-between gap-3">
                    Yalnız pilot numaralara gönder
                    <Switch name="pilot_mode" defaultChecked={connection.pilot_mode} />
                  </Label>
                  <p className="text-sm text-muted-foreground">{status.pilot_number_count ?? 0} pilot numarası kayıtlı.</p>
                  <Label className="flex items-center gap-2">
                    <input type="checkbox" checked={editPilot} onChange={event => setEditPilot(event.target.checked)} />
                    Pilot listesini değiştir
                  </Label>
                  {editPilot && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wa-pilot-numbers">Yeni pilot listesi</Label>
                      <Input id="wa-pilot-numbers" name="pilot_numbers" placeholder="+90…, +49…" aria-describedby="wa-pilot-help" />
                      <p id="wa-pilot-help" className="text-sm text-muted-foreground">Numaraları virgülle ayır. Boş kaydetmek mevcut listeyi temizler.</p>
                    </div>
                  )}
                </fieldset>
                <fieldset className="flex min-w-0 flex-col gap-3 rounded-lg border p-4">
                  <legend className="px-2 text-sm font-medium">Mesai dışında yanıt</legend>
                  <Label className="flex items-center justify-between gap-3">Mesai dışında günde bir otomatik yanıt gönder
                    <Switch name="out_of_hours_enabled" defaultChecked={connection.out_of_hours_enabled} />
                  </Label>
                  <Label htmlFor="wa-away-text">Yanıt metni</Label>
                  <Textarea id="wa-away-text" name="out_of_hours_text" maxLength={1000} defaultValue={connection.out_of_hours_text ?? ""} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Label className="flex flex-col gap-2">Başlangıç (Türkiye saati)
                      <Input name="office_start" type="number" min={0} max={23} defaultValue={connection.office_start} required />
                    </Label>
                    <Label className="flex flex-col gap-2">Bitiş
                      <Input name="office_end" type="number" min={1} max={24} defaultValue={connection.office_end} required />
                    </Label>
                  </div>
                </fieldset>
                <div className="flex justify-end"><Button type="submit" disabled={mutation.isPending}>Bildirim ayarlarını kaydet</Button></div>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pilot gönderim</CardTitle>
              <CardDescription>Onaylı şablonu kayıtlı bir pilot numarada dene.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-3" onSubmit={async event => {
                event.preventDefault();
                const fields = new FormData(event.currentTarget);
                const body = { event: pilotEvent, phone: fields.get("phone"), parameters: fields.getAll("parameter") };
                const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
                if (button?.value === "send") {
                  mutation.mutate({ path: "test-send", body: { ...body, request_id: crypto.randomUUID(), confirmed: fields.has("confirmed") } });
                  return;
                }
                setPreviewBusy(true);
                setPreview("");
                try {
                  const { data } = await api.post(`${WHATSAPP_API}/preview`, body);
                  setPreview(`${data.recipient_masked} · Şablon ${data.approved ? "onaylı" : "hazır değil"} · Pilot ${data.pilot_allowed ? "uygun" : "uygun değil"}`);
                } catch {
                  setPreview("Önizleme oluşturulamadı.");
                } finally {
                  setPreviewBusy(false);
                }
              }}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Label className="flex flex-col gap-2">Olay
                    <select className="h-10 rounded-md border bg-background px-3" value={pilotEvent} onChange={event => { setPilotEvent(event.target.value); setPreview(""); }}>
                      {Object.keys(status.events).map(event => <option key={event} value={event}>{eventLabels[event] ?? event}</option>)}
                    </select>
                  </Label>
                  <Label className="flex flex-col gap-2">Pilot numarası<Input name="phone" type="tel" required /></Label>
                  {Array.from({ length: status.events[pilotEvent]?.parameters ?? 0 }, (_, index) => (
                    <Label key={`${pilotEvent}-${index}`} className="flex flex-col gap-2">Şablon alanı {index + 1}
                      <Input name="parameter" maxLength={200} required />
                    </Label>
                  ))}
                </div>
                <Label className="flex items-center gap-2"><input type="checkbox" name="confirmed" />Bu numaraya test mesajı gönderilmesini istiyorum.</Label>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" variant="outline" value="preview" disabled={previewBusy || mutation.isPending}>Önizle</Button>
                  <Button type="submit" value="send" disabled={previewBusy || mutation.isPending}>Test mesajı gönder</Button>
                </div>
                {preview && <p role="status" className="text-sm">{preview}</p>}
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
