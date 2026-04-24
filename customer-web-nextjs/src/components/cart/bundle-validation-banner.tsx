"use client";

import { useEffect, useState } from "react";
import { Package, CheckCircle2, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useValidateBundlesMutation } from "@/modules/bundle/bundle-validate.service";
import { usePrice } from "@/hooks/use-price";

/**
 * When the cart contains bundle items, ask the server to verify the
 * discounted subtotal and surface either:
 *   - ✅ confirmation that the bundle discount applies (all items present), or
 *   - ⚠ warning that the bundle is incomplete and will be charged at
 *     standalone prices unless the missing items are re-added.
 *
 * Silent (renders nothing) when the cart has no bundle items.
 */
export function BundleValidationBanner() {
  const items = useCartStore((s) => s.items);
  const bundleIds = Array.from(new Set(items.map((i) => i.bundle_id).filter(Boolean)));
  const validate = useValidateBundlesMutation();
  const { formatPrice } = usePrice();

  const [result, setResult] = useState<
    ReturnType<typeof useValidateBundlesMutation> extends { data: infer D } ? D : null
  >(null as never);

  useEffect(() => {
    if (bundleIds.length === 0) {
      setResult(null as never);
      return;
    }

    const payload = items.map((i) => ({
      product_id: i.product_id,
      variant_id: i.variant_id ?? null,
      quantity: i.quantity,
      bundle_id: i.bundle_id ?? null,
    }));

    validate.mutate(
      { items: payload },
      {
        onSuccess: (data) => setResult(data),
      }
    );
    // Only re-validate when the bundle composition changes, not on every quantity tick
  }, [bundleIds.join(","), items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (bundleIds.length === 0) return null;
  if (!result?.bundles?.length) return null;

  return (
    <div className="mb-4 space-y-2">
      {result.bundles.map((b) =>
        b.complete ? (
          <div
            key={b.id}
            className="flex items-start gap-3 rounded-xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-700 dark:from-purple-950/60 dark:to-pink-950/60"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-900 dark:text-purple-200">
                <Package className="h-3.5 w-3.5" />
                {b.name} — paket indirimi uygulandı
              </div>
              <div className="mt-0.5 text-xs text-purple-700 dark:text-purple-300">
                {formatPrice(b.standalone_total)} yerine{" "}
                <span className="font-semibold">{formatPrice(b.bundle_price)}</span> ödüyorsun.
                {b.savings > 0 && (
                  <> <span className="font-semibold">{formatPrice(b.savings)} tasarruf</span>!</>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            key={b.id}
            className="flex items-start gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {b.name} — paket eksik
              </div>
              <div className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                Pakette {b.items_required} ürün var, sepette {b.items_in_cart} ürün görüyoruz.
                Paket indirimi uygulanmayacak — eksik ürünleri eklediğinde{" "}
                <span className="font-semibold">{formatPrice(b.bundle_price)}</span> fiyatı tekrar devreye girer.
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
