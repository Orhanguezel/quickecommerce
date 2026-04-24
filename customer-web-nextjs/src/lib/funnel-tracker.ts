/**
 * Client-side funnel event tracker.
 *
 * Pushes events into an in-memory queue, then flushes to the server via
 * POST /funnel/track every 2s or when the queue hits 20 events, whichever
 * comes first. Also flushes on `pagehide` so last-click data isn't lost.
 *
 * This module is intentionally dependency-free so it can be imported from
 * both client components and side-effect modules.
 */

import { useExperimentStore } from "@/stores/experiment-store";

export type FunnelEventName =
  | "product_viewed"
  | "add_to_cart"
  | "cart_viewed"
  | "checkout_started"
  | "order_placed"
  | "recommendation_shown"
  | "recommendation_clicked"
  | "recommendation_added"
  | "shipping_threshold_crossed"
  | "coupon_threshold_crossed"
  | "exit_intent_shown"
  | "exit_intent_converted";

export interface FunnelEventInput {
  event: FunnelEventName;
  product_id?: number;
  block_type?: string;
  amount?: number;
  meta?: Record<string, unknown>;
}

interface QueuedEvent extends FunnelEventInput {
  subject: string;
  occurred_at: string;
}

const QUEUE: QueuedEvent[] = [];
const FLUSH_EVERY_MS = 2000;
const MAX_BATCH = 20;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let installed = false;

function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_REST_API_ENDPOINT ||
    "https://sportoonline.com/api/v1"
  );
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_EVERY_MS);
}

async function flush() {
  if (QUEUE.length === 0) return;

  const batch = QUEUE.splice(0, MAX_BATCH);
  const url = `${getApiBase().replace(/\/+$/, "")}/funnel/track`;

  try {
    // navigator.sendBeacon is ideal for pagehide flushes but can't pass JSON
    // directly, so we wrap in a Blob with the right content-type.
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([JSON.stringify({ events: batch })], {
        type: "application/json",
      });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) return;
    }
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      credentials: "include",
      keepalive: true,
    });
  } catch {
    // Best-effort — requeue so the next flush tries again, up to a cap.
    if (QUEUE.length < 200) QUEUE.unshift(...batch);
  }
}

/**
 * Install page-lifecycle listeners so we don't lose tail events.
 * Idempotent — safe to call multiple times.
 */
function installLifecycleListeners() {
  if (installed) return;
  if (typeof window === "undefined") return;
  installed = true;

  const flushSync = () => { void flush(); };
  window.addEventListener("pagehide", flushSync);
  window.addEventListener("beforeunload", flushSync);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSync();
  });
}

function getSubject(): string | null {
  // Read from persisted Zustand store (survives refresh).
  try {
    return useExperimentStore.getState().subject;
  } catch {
    return null;
  }
}

/** Enqueue a single funnel event. Silently drops if we have no subject yet. */
export function trackFunnelEvent(input: FunnelEventInput): void {
  if (typeof window === "undefined") return;
  installLifecycleListeners();

  const subject = getSubject();
  if (!subject) return;

  QUEUE.push({
    ...input,
    subject,
    occurred_at: new Date().toISOString(),
  });

  if (QUEUE.length >= MAX_BATCH) {
    void flush();
  } else {
    scheduleFlush();
  }
}
