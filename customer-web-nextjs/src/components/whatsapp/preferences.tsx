"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
type Preference = { available: boolean; enabled: boolean; phone: string; text_version: string };
export function WhatsappPreferences() {
  const api=useBaseService<Preference>("/customer/profile/whatsapp-preferences").getAxiosInstance();
  const cache=useQueryClient(); const [notice,setNotice]=useState("");
  const q=useQuery({queryKey:["whatsapp-preference"],queryFn:async()=>(await api.get<Preference>("/customer/profile/whatsapp-preferences")).data});
  const save=useMutation({mutationFn:async(body:Record<string,unknown>)=>api.post("/customer/profile/whatsapp-preferences",body),onSuccess:()=>{setNotice("WhatsApp tercihiniz kaydedildi.");void cache.invalidateQueries({queryKey:["whatsapp-preference"]});},onError:()=>setNotice("Tercih kaydedilemedi. Telefon numaranızı kontrol edip tekrar deneyin.")});
  if(q.isPending) return <p>Bildirim tercihleri yükleniyor…</p>;
  if(q.isError) return <p role="alert">WhatsApp tercihi yüklenemedi.</p>;
  return <section className="mt-6 rounded-lg border p-4"><h2 className="mb-2 font-semibold">WhatsApp bildirimleri</h2>
    {!q.data.available && <p>WhatsApp bildirimleri yakında kullanılabilecek.</p>}
    {(q.data.available || q.data.enabled) && <form key={JSON.stringify(q.data)} className="space-y-3" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);save.mutate({phone:f.get("phone"),enabled:f.has("enabled"),text_version:q.data.text_version});}}>
      <label className="grid gap-1">WhatsApp numaram<input className="rounded border p-2" type="tel" name="phone" defaultValue={q.data.phone} required maxLength={30} autoComplete="tel"/></label>
      <label className="flex items-start gap-2"><input className="mt-1" type="checkbox" name="enabled" defaultChecked={q.data.enabled}/>Sipariş, ödeme, kargo ve iade güncellemelerini Sportoonline’dan WhatsApp ile almak istiyorum.</label>
      <p className="text-sm text-muted-foreground">İstediğiniz zaman buradan kapatabilir veya WhatsApp’tan DUR yazabilirsiniz. Numaranızı değiştirdiğinizde yeniden izin vermeniz gerekir.</p>
      <button className="rounded border px-4 py-2" disabled={save.isPending}>Tercihimi kaydet</button>
    </form>}{notice && <p role="status" className="mt-2">{notice}</p>}
  </section>;
}
export function WhatsappCheckoutConsent({enabled,phone,onChange}:{enabled:boolean;phone:string;onChange:(enabled:boolean,phone:string)=>void}) {
  return <section className="mt-4 space-y-2 rounded border p-3">
    <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={enabled} onChange={e=>onChange(e.target.checked,phone)}/>Bu siparişin ödeme, kargo ve iade güncellemelerini WhatsApp ile almak istiyorum.</label>
    {enabled && <label className="grid gap-1 text-sm">WhatsApp numaram<input className="min-w-0 rounded border p-2" type="tel" autoComplete="tel" value={phone} onChange={e=>onChange(enabled,e.target.value)} maxLength={30} placeholder="+90…" required/></label>}
    <p className="text-xs text-muted-foreground">İzin yalnız bu sipariş içindir. Dilediğinizde DUR yazarak kapatabilirsiniz.</p>
  </section>;
}
