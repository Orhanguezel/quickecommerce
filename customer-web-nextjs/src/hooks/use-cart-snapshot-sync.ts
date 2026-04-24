"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCartSnapshotMutation } from "@/modules/cart/abandoned-cart.service";

const SESSION_KEY = "cart_session_id";
const DEBOUNCE_MS = 5000;

/** Random UUID-ish identifier so guest carts survive across sessions. */
function ensureSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 64);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Fires a debounced snapshot request whenever the cart changes.
 *
 * Design notes:
 * - Debounced 5s so rapid quantity +/- clicks don't hammer the API.
 * - Skipped when cart is empty (no point recording an empty snapshot).
 * - Guest carts use a persistent localStorage UUID; authenticated users
 *   get their customer_id set server-side via the auth token.
 */
export function useCartSnapshotSync() {
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.user);
  const mutate = useCartSnapshotMutation();

  // Stable fingerprint so re-rendered parents don't cause extra fires
  const fingerprintRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (items.length === 0) return;

    const fp = items
      .map((i) => `${i.product_id}:${i.variant_id ?? 0}:${i.quantity}`)
      .sort()
      .join("|");

    if (fp === fingerprintRef.current) return;
    fingerprintRef.current = fp;

    const sessionId = ensureSessionId();
    const email = user?.email || undefined;

    // Anonymous user without email and without session = can't snapshot
    if (!sessionId && !email) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      mutate.mutate({
        session_id: sessionId || undefined,
        email,
        cart_items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id ?? null,
          quantity: i.quantity,
          price: i.price,
          name: i.name,
          image: i.image,
          slug: i.slug,
        })),
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, user?.email]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Clear the locally-stored cart session ID (called after successful order). */
export function getCartSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}
