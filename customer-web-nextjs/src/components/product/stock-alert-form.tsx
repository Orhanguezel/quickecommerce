"use client";

import { useState, type FormEvent } from "react";
import { Bell } from "lucide-react";
import { useLocale } from "next-intl";
import { getApiBaseUrl } from "@/lib/api-url";

interface StockAlertFormProps {
  productId: number;
  variantId: number;
  confirmationStatus?: string | null;
}

export function StockAlertForm({ productId, variantId, confirmationStatus }: StockAlertFormProps) {
  const locale = useLocale();
  const tr = locale === "tr";
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent || pending) return;
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${getApiBaseUrl()}/stock-alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ product_id: productId, variant_id: variantId, email: email.trim(), consent }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || (tr ? "Talep kaydedilemedi." : "Could not save your request."));
      setMessage(tr ? "Doğrulama bağlantısını e-postanıza gönderdik. Lütfen bağlantıya tıklayın." : "Check your email and confirm your request.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (tr ? "Bir hata oluştu." : "Something went wrong."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <h3 className="flex items-center gap-2 font-semibold"><Bell className="h-4 w-4" />{tr ? "Gelince haber ver" : "Notify me when available"}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {tr ? "Bu seçenek yeniden stokta olduğunda size bir kez e-posta gönderir." : "Get one email when this item is back in stock."}
      </p>
      {confirmationStatus === "confirmed" && <p role="status" className="mt-2 text-sm text-green-700">{tr ? "E-posta adresiniz doğrulandı; bildirim talebiniz aktif." : "Email confirmed; your alert is active."}</p>}
      {confirmationStatus === "expired" && <p role="alert" className="mt-2 text-sm text-red-700">{tr ? "Doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeniden talep oluşturun." : "Confirmation link expired. Please try again."}</p>}
      <form onSubmit={submit} className="mt-3 space-y-3">
        <label className="block text-sm font-medium" htmlFor={`stock-alert-email-${variantId}`}>
          {tr ? "E-posta adresiniz" : "Email address"}
        </label>
        <input
          id={`stock-alert-email-${variantId}`}
          type="email"
          required
          maxLength={255}
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ornek@eposta.com"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5" />
          <span>{tr ? "Yalnızca bu ürünün stoğa dönüşü için bir e-posta almak istiyorum." : "I want one email when this item is available again."}</span>
        </label>
        <button type="submit" disabled={!consent || pending} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? (tr ? "Gönderiliyor..." : "Sending...") : (tr ? "Gelince haber ver" : "Notify me")}
        </button>
        {message && <p role="status" className="text-sm text-green-700">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
    </div>
  );
}
