"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Ticket, Copy, Check, Sparkles } from "lucide-react";
import { usePrice } from "@/hooks/use-price";
import { useActiveCouponsQuery } from "@/modules/coupon/coupon.service";
import type { PublicCoupon } from "@/modules/coupon/coupon.type";

interface CouponProgressBarProps {
  /** Current cart subtotal */
  currentAmount: number;
  variant?: "compact" | "full";
}

/**
 * Finds the nearest *unlockable* coupon — i.e. the one where the user needs
 * the *least* extra spend to activate. Shows progress toward that threshold.
 *
 * If the user already qualifies for one or more coupons, shows the *best*
 * already-unlocked coupon as a success state (copy-to-clipboard).
 */
export function CouponProgressBar({ currentAmount, variant = "compact" }: CouponProgressBarProps) {
  const t = useTranslations("cart");
  const { formatPrice } = usePrice();
  const { data: coupons } = useActiveCouponsQuery();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  const { nextCoupon, unlockedCoupon } = useMemo(() => {
    if (!coupons || coupons.length === 0) {
      return { nextCoupon: null, unlockedCoupon: null };
    }

    const withThreshold = coupons.filter(
      (c) => typeof c.min_order_value === "number" && (c.min_order_value ?? 0) > 0
    );

    // Already unlocked → pick highest discount-value coupon user qualifies for
    const unlocked = withThreshold
      .filter((c) => currentAmount >= (c.min_order_value ?? 0))
      .sort((a, b) => (b.min_order_value ?? 0) - (a.min_order_value ?? 0));

    // Next unlockable → lowest threshold not yet met
    const locked = withThreshold
      .filter((c) => currentAmount < (c.min_order_value ?? 0))
      .sort((a, b) => (a.min_order_value ?? 0) - (b.min_order_value ?? 0));

    return {
      nextCoupon: (locked[0] ?? null) as PublicCoupon | null,
      unlockedCoupon: (unlocked[0] ?? null) as PublicCoupon | null,
    };
  }, [coupons, currentAmount]);

  if (!mounted) return null;
  if (!nextCoupon && !unlockedCoupon) return null;

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op, older browsers
    }
  };

  const renderDiscount = (c: PublicCoupon) =>
    c.discount_type === "percentage"
      ? `%${Math.round(c.discount)}`
      : formatPrice(c.discount);

  // ─── UNLOCKED STATE (coupon eligible) ─────────────────
  if (unlockedCoupon) {
    return (
      <div
        className={
          variant === "full"
            ? "flex items-start gap-3 rounded-xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-700 dark:from-purple-950/60 dark:to-pink-950/60"
            : "rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 dark:border-purple-800 dark:bg-purple-950/50"
        }
      >
        <Sparkles
          className={
            variant === "full"
              ? "mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400"
              : "h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400"
          }
        />
        <div className="flex-1 min-w-0">
          <p
            className={
              variant === "full"
                ? "text-sm font-semibold text-purple-900 dark:text-purple-200"
                : "text-xs font-medium text-purple-800 dark:text-purple-300"
            }
          >
            {t("coupon_unlocked", { discount: renderDiscount(unlockedCoupon) })}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <code
              className={
                variant === "full"
                  ? "rounded-md border border-purple-300 bg-white px-2.5 py-1 text-sm font-mono font-bold text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  : "rounded border border-purple-300 bg-white px-1.5 py-0.5 text-[11px] font-mono font-bold text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300"
              }
            >
              {unlockedCoupon.coupon_code}
            </code>
            <button
              type="button"
              onClick={() => handleCopy(unlockedCoupon.coupon_code)}
              aria-label="Kodu kopyala"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:text-purple-300 dark:hover:bg-purple-900/50"
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
      </div>
    );
  }

  // ─── PROGRESS STATE (working toward nextCoupon) ───────
  if (!nextCoupon) return null;

  const threshold = nextCoupon.min_order_value ?? 0;
  const remaining = Math.max(0, threshold - currentAmount);
  const progress = Math.min(100, (currentAmount / threshold) * 100);

  if (variant === "full") {
    return (
      <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-800 dark:from-purple-950/60 dark:to-pink-950/60">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
            <Ticket className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                {t("coupon_progress", {
                  remaining: formatPrice(remaining),
                  discount: renderDiscount(nextCoupon),
                  code: nextCoupon.coupon_code,
                })}
              </p>
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                {formatPrice(currentAmount)} / {formatPrice(threshold)}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-purple-200/70 dark:bg-purple-900/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 dark:border-purple-800 dark:bg-purple-950/50">
      <div className="flex items-center gap-1.5 text-xs text-purple-800 dark:text-purple-300">
        <Ticket className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 line-clamp-2">
          {t("coupon_progress", {
            remaining: formatPrice(remaining),
            discount: renderDiscount(nextCoupon),
            code: nextCoupon.coupon_code,
          })}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-purple-200 dark:bg-purple-900">
        <div
          className="h-full rounded-full bg-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
