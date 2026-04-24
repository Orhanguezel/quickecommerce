"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Package } from "lucide-react";
import { usePrice } from "@/hooks/use-price";
import type { Bundle } from "@/modules/bundle/bundle.type";

export function BundleCard({ bundle }: { bundle: Bundle }) {
  const { formatPrice } = usePrice();

  return (
    <Link
      href={`/paket/${bundle.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
    >
      {/* Hero / composite image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {bundle.image_url ? (
          <Image
            src={bundle.image_url}
            alt={bundle.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}

        {bundle.discount_percent > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-1 text-xs font-black text-white shadow-sm">
            %{bundle.discount_percent} TASARRUF
          </span>
        )}

        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-purple-700 shadow-sm">
          <Package className="h-3 w-3" />
          {bundle.items.length} ÜRÜN
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight group-hover:text-primary">
          {bundle.name}
        </h3>

        <div className="mt-auto space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(bundle.bundle_price)}
            </span>
            {bundle.original_price > bundle.bundle_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(bundle.original_price)}
              </span>
            )}
          </div>
          {bundle.savings > 0 && (
            <div className="text-xs font-medium text-green-600">
              {formatPrice(bundle.savings)} tasarruf
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
