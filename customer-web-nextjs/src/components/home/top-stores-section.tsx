"use client";

import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { Store, Star } from "lucide-react";
import Image from "next/image";
import { useTopStoresQuery } from "@/modules/store/store.action";
import type { Store as StoreType } from "@/modules/store/store.type";

interface TopStoresSectionProps {
  title: string;
}

export function TopStoresSection({ title }: TopStoresSectionProps) {
  const { data, isPending: isLoading } = useTopStoresQuery(4);
  const stores: StoreType[] = (data as { data?: StoreType[] })?.data ?? [];

  // If no data and not loading, don't render
  if (!isLoading && stores.length === 0) {
    return null;
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <section>
        <h2 className="mb-6 text-2xl font-bold">{title}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={ROUTES.STORE_DETAIL(store.slug)}
            className="group rounded-lg border bg-card p-6 transition-all hover:shadow-md"
          >
            <div className="mb-4 flex justify-center">
              {store.logo_url ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-full">
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Store className="h-10 w-10 text-primary" />
                </div>
              )}
            </div>

            <h3 className="mb-2 text-center font-semibold group-hover:text-primary">
              {store.name}
            </h3>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              {store.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{store.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
