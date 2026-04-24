"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Package, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePrice } from "@/hooks/use-price";
import { useBundleDetailQuery } from "@/modules/bundle/bundle.service";
import { useCartStore } from "@/stores/cart-store";
import { trackFunnelEvent } from "@/lib/funnel-tracker";

export function BundleDetailClient({ slug }: { slug: string }) {
  const { data: bundle, isPending } = useBundleDetailQuery(slug);
  const { formatPrice } = usePrice();
  const addToCart = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [added, setAdded] = useState(false);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-muted" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
        <Package className="mb-4 h-16 w-16 text-muted-foreground/40" />
        <p className="text-lg font-medium">Paket bulunamadı</p>
      </div>
    );
  }

  const handleAddBundle = () => {
    // Pro-rate the bundle price across items by their standalone-price weight,
    // so the cart subtotal lands exactly on bundle.bundle_price even though
    // the existing cart store is bundle-oblivious. Backend still validates
    // authoritatively at checkout (see /cart/validate-bundles).
    const weights = bundle.items.map((item) => {
      const v = item.variant;
      const standalone = v ? (v.special_price ?? v.price) : 0;
      return standalone * item.quantity;
    });
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    bundle.items.forEach((item, idx) => {
      const variant = item.variant;
      const product = item.product;
      if (!product) return;

      const share = totalWeight > 0
        ? (weights[idx] / totalWeight)
        : 1 / bundle.items.length;
      const allocatedTotal = bundle.bundle_price * share;
      const allocatedUnitPrice = item.quantity > 0
        ? allocatedTotal / item.quantity
        : allocatedTotal;

      addToCart({
        id: Date.now() + item.id,
        product_id: item.product_id,
        variant_id: variant?.id,
        name: product.name,
        slug: product.slug,
        image: product.image_url ?? "",
        price: allocatedUnitPrice,
        original_price: variant ? (variant.special_price ?? variant.price) : undefined,
        quantity: item.quantity,
        max_cart_qty: variant?.stock_quantity ?? 99,
        variant_label: variant?.variant_slug,
        bundle_id: bundle.id,
      });

      trackFunnelEvent({
        event: "add_to_cart",
        product_id: item.product_id,
        amount: allocatedTotal,
        meta: { source: "bundle", bundle_id: bundle.id },
      });
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
    openDrawer();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {bundle.image_url ? (
            <Image
              src={bundle.image_url}
              alt={bundle.name}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-24 w-24 text-muted-foreground/40" />
            </div>
          )}
          {bundle.discount_percent > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-black text-white shadow-lg">
              %{bundle.discount_percent} TASARRUF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-600">
              <Package className="h-3.5 w-3.5" />
              {bundle.items.length} ürünlük paket
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {bundle.name}
            </h1>
          </div>

          {bundle.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {bundle.description}
            </p>
          )}

          {/* Pricing */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                {formatPrice(bundle.bundle_price)}
              </span>
              {bundle.original_price > bundle.bundle_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(bundle.original_price)}
                </span>
              )}
            </div>
            {bundle.savings > 0 && (
              <div className="mt-1 text-sm font-semibold text-green-600">
                {formatPrice(bundle.savings)} tasarruf ediyorsun!
              </div>
            )}
          </div>

          <Button size="lg" onClick={handleAddBundle} disabled={added}>
            {added ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Sepete eklendi
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Paketi Sepete Ekle
              </>
            )}
          </Button>

          {/* Items */}
          <div className="mt-2">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pakete dahil ürünler
            </h2>
            <ul className="space-y-2">
              {bundle.items.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border bg-card p-3"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {product.image_url && (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/urun/${product.slug}`}
                        className="line-clamp-2 text-sm font-medium hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        Adet: {item.quantity}
                        {item.variant && ` · ${item.variant.variant_slug}`}
                      </div>
                    </div>
                    {item.variant && (
                      <div className="text-sm font-semibold">
                        {formatPrice(item.variant.special_price ?? item.variant.price)}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
