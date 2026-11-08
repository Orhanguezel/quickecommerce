"use client";
import { useState } from "react";
import WhatsappAdminGuide from "./admin-guide";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/modules/core/base.service";

type Connection = { enabled: boolean; pilot_mode: boolean; enabled_events: string[]; subscribed: boolean; out_of_hours_enabled: boolean; out_of_hours_text?: string; office_start: number; office_end: number; health: { connected?: boolean; messaging_status?: string; display_phone_number?: string } };
type Status = { configured: boolean; channel_available: boolean; callback_url: string; events: Record<string, { template: string }>; connection: Connection | null };
type Message = { id: string; event_type: string; status: string; reason?: string; recipient_masked: string; direction: string };
const statuses: Record<string,string> = {pending:"Kuyrukta",retry_wait:"Yeniden deneme bekliyor",sending:"Gönderiliyor",accepted:"Meta kabul etti",sent:"Gönderildi",delivered:"Teslim edildi",read:"Okundu",failed:"Başarısız",unknown:"Sonuç belirsiz",suppressed:"Gönderilmedi",received:"Gelen mesaj"};
const labels: Record<string, string> = {payment_confirmed: "Ödeme onayı", cod_order_accepted: "Kapıda ödeme siparişi", shipment_dispatched: "Kargoya verildi", shipment_delivered: "Teslim edildi", order_cancelled: "Sipariş iptali", refund_confirmed: "İade onayı"};
export default function WhatsappSettings() {
  const api = useBaseService<unknown>("/v1/admin/whatsapp").getAxiosInstance();
  const cache = useQueryClient();
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [mediaBusy,setMediaBusy]=useState(false);
  const query = useQuery({queryKey: ["whatsapp-status"], queryFn: async () => (await api.get<Status>("/v1/admin/whatsapp")).data});
  const messages = useQuery({queryKey: ["whatsapp-messages"], enabled: !!query.data?.configured, queryFn: async () => (await api.get<{data: Message[]}>("/v1/admin/whatsapp/messages")).data, refetchInterval: 30000});
  const conversation = useQuery({queryKey: ["whatsapp-conversation", selected], enabled: !!selected, queryFn: async () => (await api.get<{data: (Message & {content: {body?: string; text?: {body: string}; type?: string}})[]}>(`/v1/admin/whatsapp/conversations/${selected}`)).data});
  const mutation = useMutation({mutationFn: async ({path, body}: {path: string; body?: Record<string, unknown>}) => api.post(`/v1/admin/whatsapp/${path}`, body ?? {}), onSuccess: () => {setNotice("İşlem tamamlandı."); void cache.invalidateQueries({queryKey: ["whatsapp-status"]}); void cache.invalidateQueries({queryKey:["whatsapp-templates"]}); void cache.invalidateQueries({queryKey: ["whatsapp-messages"]}); void cache.invalidateQueries({queryKey: ["whatsapp-conversation"]});}, onError: () => setNotice("İşlem tamamlanamadı. Yetkinizi ve hesap bilgilerini kontrol edin.")});
  const templates = useQuery({queryKey:["whatsapp-templates"],enabled:!!query.data?.configured,queryFn:async()=>(await api.get<{data:{id:number;name:string;status:string;category:string;language:string;checked_at:string}[]}>("/v1/admin/whatsapp/templates")).data});
  const [pilotEvent,setPilotEvent]=useState("payment_confirmed");
  const [preview,setPreview]=useState<string>("");
  const status = query.data;
  if (query.isPending) return <p className="p-6">WhatsApp ayarları yükleniyor…</p>;
  if (query.isError) return <p role="alert" className="p-6">WhatsApp ayarları yüklenemedi. Yönetim yetkisi gereklidir.</p>;
  return <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
    <h1 className="text-2xl font-semibold">WhatsApp Business</h1>
    <p>Müşterilerin sipariş bildirimlerini ve gelen mesajlarını yönetin.</p>
    <p role="status" className="rounded border p-3">{status?.configured ? `Hesap bağlı · ${status.connection?.health.display_phone_number ?? "Numara doğrulanıyor"} · ${status.connection?.health.messaging_status ?? "Bilinmiyor"}` : "Yeni Sportoonline numarası henüz bağlanmadı. Numara ve Meta hesabı hazır olduğunda aşağıdan bağlayın."}</p>
    {!status?.channel_available && <p className="rounded bg-amber-50 p-3 text-amber-950">Bildirim gönderimi henüz açılmadı.</p>}
    <section className="rounded border bg-white p-4 text-gray-900" aria-label="Aktivasyon adımları">
      <h2 className="mb-3 text-lg font-medium">Kurulum ve aktivasyon</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>{status?.configured ? "✓ Hesap bilgileri kaydedildi." : "Sportoonline için yeni numarayı ve ayrı WhatsApp işletme hesabını hazırlayın; aşağıdaki bilgileri girin."}</li>
        <li>{status?.connection?.health.connected ? "✓ Numara bağlantısı doğrulandı." : "Numaranın Cloud API bağlantısını doğrulayın."}</li>
        <li>{status?.connection?.subscribed ? "✓ Webhook bağlantısı kuruldu." : "Hesap bağlandıktan sonra Webhook bağlantısını kur düğmesini kullanın."}</li>
        <li>Meta tarafından onaylanan Türkçe bildirim şablonlarını eşitleyin.</li>
        <li>Pilot numarayı ve bildirim türlerini seçin; pilot modunda etkinleştirip test mesajını doğrulayın.</li>
        <li>Test tamamlanınca pilot modunu kapatarak seçilen bildirimleri müşterilere açın.</li>
      </ol>
      <p className="mt-3 text-sm">Gönderim durumu: {status?.connection?.enabled ? (status.connection.pilot_mode ? "Yalnız pilot numaralar" : "Etkin") : "Kapalı — kurulum bekleniyor"}</p>
    </section>
    <WhatsappAdminGuide />
    {notice && <p role="status">{notice}</p>}
    <section className="rounded border bg-white p-4 text-gray-900"><h2 className="mb-3 text-lg font-medium">Hesabı bağla</h2>
      <p className="mb-3 text-sm">Sportoonline numarasına ait ayrı işletme hesabını kullanın. Kimlik bilgileri şifreli saklanır.</p>
      <form className="grid gap-3" autoComplete="off" onSubmit={e => {e.preventDefault(); const form=e.currentTarget; const data=Object.fromEntries(new FormData(form)); mutation.mutate({path:"connect",body:data}, {onSuccess: () => form.reset()});}}>
        {[["business_account_id","WhatsApp işletme hesabı ID"],["phone_number_id","Telefon numarası ID"],["access_token","Erişim anahtarı"],["app_secret","Uygulama gizli anahtarı"]].map(([name,label]) => <label className="grid gap-1" key={name}>{label}<input className="min-w-0 rounded border p-2" name={name} required type={name.includes("token") || name.includes("secret") ? "password":"text"} autoComplete="off" /></label>)}
        <button disabled={mutation.isPending} className="rounded bg-blue-700 p-2 text-white">Doğrula ve bağla</button>
      </form>
    </section>
    {status?.configured && <>
      <section className="space-y-3 rounded border p-4"><h2 className="text-lg font-medium">Bağlantı ve bildirimler</h2>
        <p className="break-all text-sm">Bildirim adresi: {status.callback_url}</p>
        <div className="flex flex-wrap gap-3">{[["refresh","Bağlantıyı kontrol et"],["subscribe","Webhook bağlantısını kur"],["templates","Şablonları eşitle"]].map(([path,label]) => <button className="rounded border p-2" disabled={mutation.isPending} key={path} onClick={() => mutation.mutate({path})}>{label}</button>)}</div>
        <form key={JSON.stringify(status.connection)} className="space-y-3" onSubmit={e => {e.preventDefault(); const f=new FormData(e.currentTarget); mutation.mutate({path:"settings",body:{enabled:f.has("enabled"),pilot_mode:f.has("pilot_mode"),pilot_numbers:String(f.get("pilot_numbers") ?? "").split(/[\n,]+/).map(s=>s.trim()).filter(Boolean),enabled_events:f.getAll("events"),out_of_hours_enabled:f.has("out_of_hours_enabled"),out_of_hours_text:f.get("out_of_hours_text"),office_start:Number(f.get("office_start")),office_end:Number(f.get("office_end"))}});}}>
          <label className="flex gap-2"><input type="checkbox" name="enabled" defaultChecked={status.connection?.enabled}/>Bildirimleri etkinleştir</label>
          <label className="flex gap-2"><input type="checkbox" name="pilot_mode" defaultChecked={status.connection?.pilot_mode}/>Yalnız pilot numaralara gönder</label>
          <label className="grid gap-1">Pilot numaralar (virgülle ayırın)<input name="pilot_numbers" className="rounded border p-2" placeholder="+90…"/></label>
          <p className="text-sm">Kaydederken pilot numaraları yeniden girin.</p>
          {Object.keys(status.events).map(event => <label className="flex gap-2" key={event}><input type="checkbox" name="events" value={event} defaultChecked={status.connection?.enabled_events.includes(event)}/>{labels[event] ?? event}</label>)}
          <fieldset className="space-y-2 border-t pt-3"><legend>Mesai dışında yanıt</legend>
            <label className="flex gap-2"><input type="checkbox" name="out_of_hours_enabled" defaultChecked={status.connection?.out_of_hours_enabled}/>Mesai dışında günde bir otomatik yanıt gönder</label>
            <label className="grid gap-1">Yanıt metni<textarea name="out_of_hours_text" maxLength={1000} defaultValue={status.connection?.out_of_hours_text ?? ""} className="rounded border p-2"/></label>
            <div className="flex flex-wrap gap-3"><label>Başlangıç (Türkiye saati)<input className="ml-2 w-16 rounded border p-2" type="number" name="office_start" min={0} max={23} defaultValue={status.connection?.office_start ?? 9}/></label><label>Bitiş<input className="ml-2 w-16 rounded border p-2" type="number" name="office_end" min={1} max={24} defaultValue={status.connection?.office_end ?? 18}/></label></div>
          </fieldset>
          <button disabled={mutation.isPending} className="rounded bg-blue-700 p-2 text-white">Bildirim ayarlarını kaydet</button>
        </form>
      </section>
      <section className="space-y-3 rounded border p-4"><h2 className="text-lg font-medium">Şablonlar</h2>{templates.data?.data.map(t=><div className="break-all border-b pb-2" key={t.id}><strong>{t.name}</strong><p>{t.language} · {t.category} · {t.status}</p><p className="text-sm">Son kontrol: {t.checked_at}</p></div>)}{templates.data?.data.length===0 && <p>Şablon bulunamadı. Meta onayından sonra eşitleyin.</p>}</section>
      <section className="space-y-3 rounded border p-4"><h2 className="text-lg font-medium">Pilot gönderim</h2><p>Önizleme mesaj göndermez. Test gönderimi yalnız pilot numaralara yapılır.</p>
        <form className="space-y-3" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const body={event:pilotEvent,phone:f.get("phone"),parameters:f.getAll("parameter")}; const submitter=(e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;if(submitter?.value==="send"){mutation.mutate({path:"test-send",body:{...body,request_id:crypto.randomUUID(),confirmed:f.has("confirmed")}});}else{try{const result=await api.post("/v1/admin/whatsapp/preview",body);setPreview(`${result.data.recipient_masked} · Şablon ${result.data.approved ? "onaylı":"hazır değil"} · Pilot ${result.data.pilot_allowed ? "uygun":"uygun değil"}`);}catch{setPreview("Önizleme oluşturulamadı.");}}}}>
          <label className="grid gap-1">Olay<select className="rounded border p-2" value={pilotEvent} onChange={e=>setPilotEvent(e.target.value)}>{Object.keys(status.events).map(event=><option key={event} value={event}>{labels[event]}</option>)}</select></label>
          <label className="grid gap-1">Pilot numarası<input className="rounded border p-2" name="phone" type="tel" required/></label>
          {Array.from({length:pilotEvent==="shipment_dispatched"?4:["payment_confirmed","cod_order_accepted"].includes(pilotEvent)?3:2},(_,i)=><label className="grid gap-1" key={`${pilotEvent}-${i}`}>Şablon alanı {i+1}<input className="rounded border p-2" name="parameter" maxLength={200} required/></label>)}
          <label className="flex gap-2"><input type="checkbox" name="confirmed"/>Bu numaraya test mesajı gönderilmesini istiyorum.</label>
          <div className="flex flex-wrap gap-2"><button className="rounded border p-2" name="action" value="preview">Önizle</button><button className="rounded bg-blue-700 p-2 text-white" name="action" value="send" disabled={mutation.isPending}>Test mesajı gönder</button></div>
          {preview && <p role="status">{preview}</p>}
        </form>
      </section>
      <section className="space-y-3 rounded border p-4"><h2 className="text-lg font-medium">Mesajlar</h2>
        {messages.isError && <p role="alert">Mesajlar yüklenemedi. Gelen kutusu yetkisi gereklidir.</p>}
        {messages.data?.data.length === 0 && <p>Henüz mesaj yok.</p>}
        {messages.data?.data.map(m => <button className="block w-full rounded border p-3 text-left" key={m.id} onClick={()=>setSelected(m.id)}>{m.recipient_masked} · {labels[m.event_type] ?? m.event_type} · {statuses[m.status] ?? m.status}{m.reason && ` (${m.reason})`}</button>)}
        {selected && <button className="rounded border p-2" disabled={mutation.isPending} onClick={()=>mutation.mutate({path:`messages/${selected}/retry`})}>Kesin geçici hatada yeniden dene</button>}
        {selected && <div className="space-y-3 border-t pt-3"><h3>Konuşma</h3><button className="rounded border p-2" disabled={mutation.isPending || !conversation.data?.data.some(m=>m.direction==="inbound")} onClick={()=>{const m=conversation.data?.data.find(m=>m.direction==="inbound");if(m)mutation.mutate({path:`messages/${m.id}/read`});}}>Okundu bilgisi gönder</button>{conversation.data?.data.map(m=><p className="break-words rounded bg-gray-50 p-2 text-gray-900" key={m.id}>{m.direction === "inbound" ? "Müşteri" : "Sportoonline"}: {m.content.text?.body ?? m.content.body ?? m.event_type}{m.direction==="inbound" && ["image","document"].includes(m.content.type ?? "") && <button className="ml-2 underline" onClick={async()=>{try{const r=await api.get(`/v1/admin/whatsapp/messages/${m.id}/media`,{responseType:"blob"});const url=URL.createObjectURL(r.data);const a=document.createElement("a");a.href=url;a.download="whatsapp-attachment";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setNotice("Dosya indirilemedi.");}}}>Dosyayı indir</button>}</p>)}
          <form onSubmit={e=>{e.preventDefault(); const incoming=conversation.data?.data.find(m=>m.direction==="inbound"); if(incoming) mutation.mutate({path:`conversations/${incoming.id}/reply`,body:{body:reply,request_id:crypto.randomUUID()}},{onSuccess:()=>setReply("")});}}><label className="grid gap-1">Yanıt<textarea className="rounded border p-2" value={reply} onChange={e=>setReply(e.target.value)} maxLength={4096}/></label><button className="mt-2 rounded border p-2" disabled={mutation.isPending || !reply.trim() || !conversation.data?.data.some(m=>m.direction==="inbound")}>Yanıtı gönder</button><p className="text-sm">Müşterinin son mesajından sonraki 24 saat içinde yanıtlanabilir.</p></form>
          <form onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;const inbound=conversation.data?.data.find(m=>m.direction==="inbound");if(!inbound)return; const data=new FormData(form) as FormData & {multipart:boolean};data.append("request_id",crypto.randomUUID());data.multipart=true;setMediaBusy(true);try{await api.post(`/v1/admin/whatsapp/conversations/${inbound.id}/media`,data);form.reset();setNotice("Dosya gönderim kuyruğuna alındı.");void cache.invalidateQueries({queryKey:["whatsapp-conversation"]});}catch{setNotice("Dosya gönderilemedi. Tür, boyut ve yanıt süresini kontrol edin.");}finally{setMediaBusy(false);}}}><label className="grid gap-1">Dosya (JPEG, PNG veya PDF; en fazla 5 MB)<input className="min-w-0 max-w-full" name="file" type="file" accept="image/jpeg,image/png,application/pdf" required/></label><button className="mt-2 rounded border p-2" disabled={mediaBusy || !conversation.data?.data.some(m=>m.direction==="inbound")}>Dosyayı gönder</button></form>
        </div>}
      </section>
    </>}
  </main>;
}
