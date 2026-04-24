"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Gift, Copy, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

const STORAGE_KEY = "exit_intent_shown";
const DEFAULT_COUPON_CODE = "AYRILMA5";
const DEFAULT_DISCOUNT_LABEL = "%5";

interface ExitIntentPopupProps {
  /** Coupon code to offer (defaults to AYRILMA5) */
  couponCode?: string;
  /** Label shown on the discount badge (e.g. "%5", "20 TL") */
  discountLabel?: string;
  /** Only trigger when cart has items (default true) */
  requireCart?: boolean;
}

/**
 * Shows a promo popup when user's mouse leaves the window through the top
 * (indicating they're about to close tab / navigate away). Fires once per
 * browser session.
 */
export function ExitIntentPopup({
  couponCode = DEFAULT_COUPON_CODE,
  discountLabel = DEFAULT_DISCOUNT_LABEL,
  requireCart = true,
}: ExitIntentPopupProps) {
  const t = useTranslations("cart");
  const items = useCartStore((s) => s.items);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const alreadyShownRef = useRef(false);

  useEffect(() => {
    // Respect session-level "already shown" flag
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        alreadyShownRef.current = true;
      }
    } catch {
      // sessionStorage unavailable — just skip
    }

    const handleMouseOut = (e: MouseEvent) => {
      if (alreadyShownRef.current) return;
      // Leaving through the top edge with no relatedTarget = intent to close / switch tab
      if (e.clientY > 0 || e.relatedTarget) return;
      if (requireCart && items.length === 0) return;

      alreadyShownRef.current = true;
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      setIsOpen(true);
    };

    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, [items.length, requireCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // older browsers — no-op
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl dark:bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Kapat"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-700 transition-colors hover:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Gradient banner */}
        <div className="relative flex flex-col items-center gap-3 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 px-6 py-8 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Gift className="h-7 w-7" />
          </div>
          <h2
            id="exit-intent-title"
            className="text-center text-2xl font-bold leading-tight"
          >
            {t("exit_intent_title")}
          </h2>
          <p className="text-center text-sm text-white/90">
            {t("exit_intent_subtitle", { discount: discountLabel })}
          </p>
        </div>

        {/* Coupon reveal */}
        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-center dark:border-amber-600 dark:bg-amber-950/50">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
              {t("exit_intent_code_label")}
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-2xl font-black tracking-wider text-amber-900 dark:text-amber-200">
                {couponCode}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {t("copy")}
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("exit_intent_continue")}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {t("exit_intent_dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
