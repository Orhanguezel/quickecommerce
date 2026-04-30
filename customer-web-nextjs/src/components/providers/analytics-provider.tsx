"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackFunnelEvent } from "@/lib/funnel-tracker";

function AnalyticsEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const key = query ? `${pathname}?${query}` : pathname;
    if (lastTrackedRef.current === key) return;
    lastTrackedRef.current = key;

    const segments = pathname.split("/").filter(Boolean);
    const locale = segments[0];
    const section = segments[1];
    const q = searchParams.get("q")?.trim();

    trackFunnelEvent({
      event: "page_view",
      locale,
      meta: {
        section: section || "home",
        query: query || undefined,
      },
    });

    if (section === "ara" && q) {
      trackFunnelEvent({
        event: "search",
        locale,
        meta: { query: q },
      });
    }

    if (section === "kategori") {
      trackFunnelEvent({
        event: "category_view",
        locale,
        meta: { slug: segments[2] },
      });
    }

    if (section === "magaza") {
      trackFunnelEvent({
        event: "store_view",
        locale,
        meta: { slug: segments[2] },
      });
    }

    if (section === "sepet") {
      trackFunnelEvent({ event: "cart_view", locale });
    }

    if (section === "odeme") {
      trackFunnelEvent({ event: "checkout_start", locale });
    }

    if (section === "siparis-basarili") {
      const orderId = searchParams.get("order");
      trackFunnelEvent({
        event: "payment_success",
        locale,
        order_id: orderId ? Number(orderId) : undefined,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsEvents />
    </Suspense>
  );
}
