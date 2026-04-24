"use client";

import { useTranslations } from "next-intl";
import { Flame, AlertTriangle } from "lucide-react";

interface StockUrgencyBadgeProps {
  /** Stock quantity (or max_cart_qty as a proxy) */
  stock: number;
  /** Threshold below which the urgency badge appears (default 5) */
  threshold?: number;
  size?: "sm" | "md";
}

/**
 * Renders a red "Son X adet!" badge when stock is running low.
 * - stock ≤ 2 : pulsing, higher urgency (red-600)
 * - stock ≤ 5 : static warning (red-500)
 * - above threshold → nothing
 */
export function StockUrgencyBadge({
  stock,
  threshold = 5,
  size = "sm",
}: StockUrgencyBadgeProps) {
  const t = useTranslations("cart");

  if (!stock || stock <= 0 || stock > threshold) return null;

  const critical = stock <= 2;
  const Icon = critical ? AlertTriangle : Flame;

  const sizeCls =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : "px-2 py-0.5 text-[11px]";

  const colorCls = critical
    ? "bg-red-600 text-white animate-pulse"
    : "bg-red-500 text-white";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold shadow-sm ${sizeCls} ${colorCls}`}
      role="status"
    >
      <Icon className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      {t("stock_urgency", { count: stock })}
    </span>
  );
}
