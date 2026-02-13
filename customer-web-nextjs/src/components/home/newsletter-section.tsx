"use client";

import { useState } from "react";
import { Bell, Mail, MailCheck, Smartphone, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useNewsletterSubscribeMutation } from "@/modules/newsletter/newsletter.action";

interface NewsletterSectionProps {
  title: string;
  subtitle?: string;
}

/* Floating decorative icon wrapper */
function FloatingIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute hidden items-center justify-center rounded-xl bg-card p-2.5 shadow-lg md:flex ${className}`}
    >
      {children}
    </div>
  );
}

/* Small decorative dot / cross / plus */
function Dot({ className }: { className?: string }) {
  return (
    <span
      className={`absolute hidden h-2 w-2 rounded-full bg-blue-300/60 md:block ${className}`}
    />
  );
}

function Cross({ className }: { className?: string }) {
  return (
    <span
      className={`absolute hidden text-xs font-bold text-blue-300/60 md:block ${className}`}
    >
      &times;
    </span>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <span
      className={`absolute hidden text-sm font-bold text-blue-300/50 md:block ${className}`}
    >
      +
    </span>
  );
}

export function NewsletterSection({ title, subtitle }: NewsletterSectionProps) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const subscribeMutation = useNewsletterSubscribeMutation();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage({
        type: "error",
        text:
          t("newsletter.invalid_email") || "Geçerli bir e-posta adresi girin",
      });
      return;
    }

    setMessage(null);

    subscribeMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          setMessage({
            type: "success",
            text:
              data.message ||
              t("newsletter.success") ||
              "Başarıyla abone oldunuz!",
          });
          setEmail("");
        },
        onError: (
          error: Error & { response?: { data?: { message?: string } } }
        ) => {
          const errorMessage =
            error?.response?.data?.message ||
            t("newsletter.error") ||
            "Bir hata oluştu, lütfen tekrar deneyin";
          setMessage({ type: "error", text: errorMessage });
        },
      }
    );
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#EDF4FE] dark:bg-primary/10 py-14 md:py-20">
      {/* ── SVG wave decorations ── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top wave */}
        <path
          d="M0 80 C360 0, 720 160, 1440 60 L1440 0 L0 0Z"
          fill="#D9E8FC"
          opacity="0.4"
        />
        {/* Bottom wave */}
        <path
          d="M0 320 C480 400, 960 280, 1440 360 L1440 400 L0 400Z"
          fill="#D9E8FC"
          opacity="0.35"
        />
        {/* Middle subtle wave */}
        <path
          d="M0 200 C300 170, 600 230, 900 190 C1200 150, 1350 220, 1440 200"
          stroke="#C8DDFB"
          strokeWidth="1.5"
          opacity="0.3"
          fill="none"
        />
      </svg>

      {/* ── Floating decorative icons ── */}
      {/* Bell — top left */}
      <FloatingIcon className="left-[8%] top-[15%]">
        <Bell className="h-6 w-6 text-blue-400" />
      </FloatingIcon>

      {/* Smartphone — bottom left */}
      <FloatingIcon className="bottom-[20%] left-[12%]">
        <Smartphone className="h-6 w-6 text-blue-400" />
      </FloatingIcon>

      {/* MailCheck — mid-left */}
      <FloatingIcon className="bottom-[35%] left-[5%]">
        <MailCheck className="h-5 w-5 text-blue-400" />
      </FloatingIcon>

      {/* Mail badge — top right */}
      <FloatingIcon className="right-[8%] top-[12%]">
        <div className="relative">
          <Mail className="h-6 w-6 text-blue-400" />
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white">
            1
          </span>
        </div>
      </FloatingIcon>

      {/* FileText — bottom right */}
      <FloatingIcon className="bottom-[18%] right-[10%]">
        <FileText className="h-6 w-6 text-blue-400" />
      </FloatingIcon>

      {/* ── Small decorative elements ── */}
      <Dot className="left-[18%] top-[30%]" />
      <Dot className="left-[25%] top-[20%]" />
      <Dot className="right-[20%] top-[25%]" />
      <Cross className="left-[15%] top-[60%]" />
      <Cross className="right-[15%] top-[55%]" />
      <Plus className="left-[22%] top-[75%]" />
      <Plus className="right-[6%] top-[40%]" />
      <Plus className="left-[7%] top-[45%]" />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-xl px-4 text-center">
        <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
        )}

        <form
          onSubmit={handleSubscribe}
          className="mx-auto flex max-w-lg items-center overflow-hidden rounded-full bg-card shadow-lg"
        >
          <input
            type="email"
            placeholder={
              t("newsletter.email_placeholder") || "Enter Your Email"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribeMutation.isPending}
            className="flex-1 border-none bg-transparent px-6 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="mr-1.5 shrink-0 rounded-full bg-blue-500 px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
          >
            {subscribeMutation.isPending
              ? t("common.loading") || "..."
              : t("newsletter.subscribe") || "Subscribe"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
