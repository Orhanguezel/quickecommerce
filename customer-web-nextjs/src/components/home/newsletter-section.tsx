"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNewsletterSubscribeMutation } from "@/modules/newsletter/newsletter.action";

interface NewsletterSectionProps {
  title: string;
  subtitle?: string;
}

export function NewsletterSection({ title, subtitle }: NewsletterSectionProps) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const subscribeMutation = useNewsletterSubscribeMutation();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: t("newsletter.invalid_email") || "Geçerli bir e-posta adresi girin" });
      return;
    }

    setMessage(null);

    subscribeMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          setMessage({ type: "success", text: data.message || t("newsletter.success") || "Başarıyla abone oldunuz!" });
          setEmail("");
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
          const errorMessage = error?.response?.data?.message || t("newsletter.error") || "Bir hata oluştu, lütfen tekrar deneyin";
          setMessage({ type: "error", text: errorMessage });
        },
      }
    );
  };

  return (
    <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h2 className="mb-3 text-2xl font-bold md:text-3xl">{title}</h2>
        {subtitle && (
          <p className="mb-6 text-muted-foreground">{subtitle}</p>
        )}

        <form onSubmit={handleSubscribe} className="mx-auto flex max-w-md gap-2">
          <Input
            type="email"
            placeholder={t("newsletter.email_placeholder") || "E-posta adresiniz"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={subscribeMutation.isPending}
          />
          <Button type="submit" disabled={subscribeMutation.isPending} className="shrink-0">
            {subscribeMutation.isPending ? t("common.loading") || "Yükleniyor..." : t("newsletter.subscribe") || "Abone Ol"}
          </Button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
