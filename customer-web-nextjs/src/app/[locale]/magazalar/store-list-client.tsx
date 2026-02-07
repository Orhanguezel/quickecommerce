"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ChevronRight, Star, MapPin, ShoppingBag } from "lucide-react";
import type { Store } from "@/modules/store/store.type";

interface StoreListTranslations {
  stores: string;
  store_count: string;
  featured: string;
  products: string;
  no_results: string;
  previous: string;
  next: string;
  home: string;
  view_store: string;
  rating: string;
}

interface StoreListClientProps {
  stores: Store[];
  totalPages: number;
  totalStores: number;
  currentPage: number;
  translations: StoreListTranslations;
}

export function StoreListClient({
  stores,
  totalPages,
  totalStores,
  currentPage,
  translations: t,
}: StoreListClientProps) {
  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return `/magazalar${query ? `?${query}` : ""}`;
  }

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t.stores}</span>
      </nav>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{t.stores}</h1>
        {totalStores > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {totalStores} {t.store_count}
          </p>
        )}
      </div>

      {/* Store Grid */}
      {stores.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} translations={t} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t.no_results}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              {t.previous}
            </Link>
          )}

          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            let page: number;
            if (totalPages <= 7) {
              page = i + 1;
            } else if (currentPage <= 4) {
              page = i + 1;
            } else if (currentPage >= totalPages - 3) {
              page = totalPages - 6 + i;
            } else {
              page = currentPage - 3 + i;
            }

            return (
              <Link
                key={page}
                href={buildPageUrl(page)}
                className={`rounded-md border px-3 py-2 text-sm ${
                  page === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {page}
              </Link>
            );
          })}

          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              {t.next}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

function StoreCard({
  store,
  translations: t,
}: {
  store: Store;
  translations: StoreListTranslations;
}) {
  return (
    <Link
      href={`/magaza/${store.slug}`}
      className="group overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
    >
      {/* Banner */}
      <div className="relative h-32 bg-muted">
        {store.banner_url ? (
          <Image
            src={store.banner_url}
            alt={store.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        {store.is_featured === 1 && (
          <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            {t.featured}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-background shadow-sm">
            {store.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-bold text-muted-foreground">
                {store.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold group-hover:text-primary">
              {store.name}
            </h3>

            {/* Rating */}
            {store.rating > 0 && (
              <div className="mt-0.5 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  {store.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Address */}
            {store.address && (
              <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="line-clamp-1">{store.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
