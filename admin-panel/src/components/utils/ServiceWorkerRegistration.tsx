// =============================================================
// FILE: src/components/utils/ServiceWorkerRegistration.tsx
// FINAL — idempotent SW register + safe guards
// - avoids duplicate register attempts
// - no console noise in production
// =============================================================

"use client";

import { useEffect, useRef } from "react";

export const ServiceWorkerRegistration = () => {
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // If already controlling the page, we can skip (optional).
    // (Still okay to register; this just reduces unnecessary work.)
    if (navigator.serviceWorker.controller) return;

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js", { scope: "/" })
      .catch((err) => {
        // In production, keep silent. In dev, it's useful to see.
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("SW register failed:", err);
        }
      });
  }, []);

  return null;
};
