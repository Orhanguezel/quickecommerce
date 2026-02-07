"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { ChevronRight, Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

interface ContactTranslations {
  contact: string;
  contact_subtitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  send: string;
  success: string;
  error: string;
  home: string;
}

interface ContactPageClientProps {
  siteInfo: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  translations: ContactTranslations;
}

export function ContactPageClient({
  siteInfo,
  translations: t,
}: ContactPageClientProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || "";
      const apiBase = baseUrl.replace("/api/v1", "");
      const res = await fetch(`${apiBase}/api/contact-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">{t.home}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t.contact}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{t.contact}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.contact_subtitle}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.name} *</label>
              <input
                type="text"
                required
                maxLength={255}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.email} *</label>
              <input
                type="email"
                required
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.phone}</label>
            <input
              type="tel"
              maxLength={15}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t.message} *</label>
            <textarea
              required
              maxLength={2000}
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          {status === "success" && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              {t.success}
            </div>
          )}
          {status === "error" && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {t.error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {status === "loading" ? "..." : t.send}
          </button>
        </form>

        {/* Contact Info */}
        <aside className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="space-y-3 text-sm">
              {siteInfo.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{siteInfo.address}</span>
                </div>
              )}
              {siteInfo.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${siteInfo.email}`} className="hover:text-foreground">
                    {siteInfo.email}
                  </a>
                </div>
              )}
              {siteInfo.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href={`tel:${siteInfo.phone}`} className="hover:text-foreground">
                    {siteInfo.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
