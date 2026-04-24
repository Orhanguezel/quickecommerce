"use client";

import { useCartSnapshotSync } from "@/hooks/use-cart-snapshot-sync";

/**
 * Headless component — renders nothing. Its single job is to mount
 * {@link useCartSnapshotSync} inside a client boundary so cart changes
 * get sent to the abandoned-cart snapshot endpoint.
 */
export function CartSnapshotSync() {
  useCartSnapshotSync();
  return null;
}
