"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Truck, CheckCircle2 } from "lucide-react";
import { usePrice } from "@/hooks/use-price";

interface FreeShippingProgressBarProps {
  /** Current cart subtotal */
  currentAmount: number;
  /** Free shipping threshold (0 or less = feature disabled) */
  threshold: number;
  /** Shipping cost applied when below threshold (optional, for "full" variant) */
  shippingCharge?: number;
  /** Visual variant — compact for drawer, full for cart page */
  variant?: "compact" | "full";
}

export function FreeShippingProgressBar({
  currentAmount,
  threshold,
  shippingCharge = 0,
  variant = "compact",
}: FreeShippingProgressBarProps) {
  const t = useTranslations("cart");
  const { formatPrice } = usePrice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (threshold <= 0) return null;

  const remaining = Math.max(0, threshold - currentAmount);
  const progress = Math.min(100, (currentAmount / threshold) * 100);
  const earned = remaining <= 0;

  const fmt = (v: number) => (mounted ? formatPrice(v) : v.toFixed(2));

  // ─── EARNED STATE ──────────────────────────────────────
  if (earned) {
    return (
      <div
        className={
          variant === "full"
            ? "flex items-start gap-3 rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-green-800 dark:border-green-700 dark:from-green-950/60 dark:to-emerald-950/60 dark:text-green-300"
            : "flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300"
        }
        role="status"
        aria-live="polite"
      >
        <CheckCircle2
          className={
            variant === "full"
              ? "mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
              : "h-3.5 w-3.5 shrink-0"
          }
        />
        <div className={variant === "full" ? "flex-1" : ""}>
          <p className={variant === "full" ? "text-sm font-semibold" : ""}>
            {t("free_shipping_earned")}
          </p>
          {variant === "full" && (
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-green-200 dark:bg-green-900">
              <div className="h-full rounded-full bg-green-500" style={{ width: "100%" }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── IN-PROGRESS STATE ─────────────────────────────────
  const progressMessage = t("free_shipping_progress", { remaining: fmt(remaining) });

  if (variant === "full") {
    return (
      <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-950/60 dark:to-orange-950/60">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
            <Truck className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {progressMessage}
              </p>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                {fmt(currentAmount)} / {fmt(threshold)}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-200/70 dark:bg-amber-900/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {shippingCharge > 0 && (
              <p className="text-xs text-amber-700/90 dark:text-amber-400/80">
                {t("free_shipping_threshold", { shipping: fmt(shippingCharge) })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Compact variant (drawer)
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/50">
      <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300">
        <Truck className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1">{progressMessage}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
