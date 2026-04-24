"use client";

import { useEffect, useState } from "react";
import { Flame, Clock } from "lucide-react";

interface VelocityInfo {
  daily_sales_avg: number;
  current_stock: number;
  days_of_supply: number | null;
  urgency: "critical" | "high" | "medium" | "low" | "unknown";
}

const COLORS = {
  critical: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  high:     "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300",
  medium:   "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
} as const;

export function VelocityBadge({ productId }: { productId: number }) {
  const [info, setInfo] = useState<VelocityInfo | null>(null);

  useEffect(() => {
    const base = (
      process.env.NEXT_PUBLIC_REST_API_ENDPOINT ||
      "https://sportoonline.com/api/v1"
    ).replace(/\/+$/, "");
    const url = `${base}/products/${productId}/velocity`;

    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        setInfo(res?.data ?? null);
      })
      .catch(() => {
        // silent — decorative only
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!info || info.days_of_supply === null) return null;
  if (info.urgency === "low" || info.urgency === "unknown") return null;

  const days = Math.max(1, Math.round(info.days_of_supply));
  const Icon = info.urgency === "critical" ? Flame : Clock;
  const label =
    info.urgency === "critical"
      ? `Bu hızda ${days} gün içinde tükenebilir!`
      : `Mevcut hızda ${days} günlük stok kaldı`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${COLORS[info.urgency]}`}
      role="status"
      aria-live="polite"
    >
      <Icon className={info.urgency === "critical" ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
