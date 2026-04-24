"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useExperimentStore } from "@/stores/experiment-store";

interface LiveViewersBadgeProps {
  productId: number;
  /** Only render if viewers ≥ minThreshold — hides the badge for quiet products */
  minThreshold?: number;
}

const HEARTBEAT_INTERVAL_MS = 20_000;

/**
 * Pings the server every 20s with the current subject's presence for this
 * product, then renders "X kişi şu an bakıyor" when it's socially-proof
 * worthy. The badge intentionally doesn't render below the threshold to
 * avoid making quiet products look worse.
 */
export function LiveViewersBadge({
  productId,
  minThreshold = 3,
}: LiveViewersBadgeProps) {
  const subject = useExperimentStore((s) => s.subject);
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    if (!subject) return;

    const base = (
      process.env.NEXT_PUBLIC_REST_API_ENDPOINT ||
      "https://sportoonline.com/api/v1"
    ).replace(/\/+$/, "");
    const url = `${base}/products/${productId}/live-viewers/heartbeat`;

    let cancelled = false;

    const ping = async () => {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject }),
          credentials: "include",
          keepalive: true,
        });
        const data = await res.json();
        if (!cancelled && typeof data?.viewers === "number") {
          setViewers(data.viewers);
        }
      } catch {
        // silent — this is a decorative feature, never block the UX
      }
    };

    ping();
    const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [productId, subject]);

  if (viewers < minThreshold) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-950/60 dark:text-orange-300"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
      </span>
      <Eye className="h-3 w-3" />
      {viewers} kişi şu an bakıyor
    </span>
  );
}
