"use client";

import { Package } from "lucide-react";
import { BundleCard } from "@/components/bundle/bundle-card";
import { useActiveBundlesQuery } from "@/modules/bundle/bundle.service";

export function BundleListClient() {
  const { data: bundles = [], isPending } = useActiveBundlesQuery(24);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
          <Package className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paket Fırsatları</h1>
          <p className="text-sm text-muted-foreground">
            Birlikte alındığında daha uygun fiyatlı paketler
          </p>
        </div>
      </header>

      {isPending ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[340px] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="mb-4 h-20 w-20 text-muted-foreground/30" />
          <p className="text-lg font-medium">Henüz aktif bir paket yok</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Yeni paketler yakında burada olacak.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {bundles.map((b) => (
            <BundleCard key={b.id} bundle={b} />
          ))}
        </div>
      )}
    </div>
  );
}
