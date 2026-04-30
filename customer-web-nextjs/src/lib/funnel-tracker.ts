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
  | "page_view"
  | "product_view"
  | "category_view"
  | "search"
  | "store_view"
  | "product_click"
  | "add_to_cart"
  | "remove_from_cart"
  | "cart_view"
  | "checkout_start"
  | "shipping_selected"
  | "payment_selected"
  | "order_created"
  | "payment_success"
  | "payment_failed"
  | "banner_click"
  | "coupon_view"
  | "coupon_apply"
  | "recommendation_view"
  | "recommendation_click"
  | "recommendation_add"
  | "shipping_threshold_crossed"
  | "coupon_threshold_crossed"
  | "exit_intent_shown"
  | "exit_intent_converted";

export interface FunnelEventInput {
  event: FunnelEventName;
  product_id?: number;
  category_id?: number;
  order_id?: number;
  block_type?: string;
  amount?: number;
  url?: string;
  path?: string;
  locale?: string;
  referer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  meta?: Record<string, unknown>;
}

interface QueuedEvent extends FunnelEventInput {
  subject: string;
  visitor_id: string;
  session_id: string;
  occurred_at: string;
}

const QUEUE: QueuedEvent[] = [];
const FLUSH_EVERY_MS = 2000;
const MAX_BATCH = 20;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let installed = false;

const VISITOR_KEY = "sportoonline_visitor_id";
const SESSION_KEY = "sportoonline_session_id";

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

function randomId(prefix: string): string {
  const cryptoObj = typeof crypto !== "undefined" ? crypto : null;
  const raw =
    cryptoObj && "randomUUID" in cryptoObj
      ? cryptoObj.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}:${raw}`;
}

function getOrCreateVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const next = randomId("v");
    window.localStorage.setItem(VISITOR_KEY, next);
    return next;
  } catch {
    return null;
  }
}

function getOrCreateSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = randomId("s");
    window.sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return null;
  }
}

function pageContext(): Partial<FunnelEventInput> {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const parts = url.pathname.split("/").filter(Boolean);
  return {
    url: url.href,
    path: url.pathname,
    locale: parts[0] || undefined,
    referer: document.referrer || undefined,
    utm_source: url.searchParams.get("utm_source") || undefined,
    utm_medium: url.searchParams.get("utm_medium") || undefined,
    utm_campaign: url.searchParams.get("utm_campaign") || undefined,
    utm_term: url.searchParams.get("utm_term") || undefined,
    utm_content: url.searchParams.get("utm_content") || undefined,
  };
}

/** Enqueue a single funnel event with first-party visitor and session context. */
export function trackFunnelEvent(input: FunnelEventInput): void {
  if (typeof window === "undefined") return;
  installLifecycleListeners();

  const visitorId = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();
  if (!visitorId || !sessionId) return;

  const subject = getSubject() ?? visitorId;

  QUEUE.push({
    ...pageContext(),
    ...input,
    subject,
    visitor_id: visitorId,
    session_id: sessionId,
    occurred_at: new Date().toISOString(),
  });

  if (QUEUE.length >= MAX_BATCH) {
    void flush();
  } else {
    scheduleFlush();
  }
}
