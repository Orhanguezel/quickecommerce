"use client";

import { Link, useRouter } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import Image from "next/image";
import { ChevronRight, ShoppingBag } from "lucide-react";
import type { Store, StoreType } from "@/modules/store/store.type";

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
  select_type: string;
}

interface StoreListClientProps {
  stores: Store[];
  totalPages: number;
  totalStores: number;
  currentPage: number;
  storeTypes?: StoreType[];
  currentType?: string;
  translations: StoreListTranslations;
}

export function StoreListClient({
  stores,
  totalPages,
  totalStores,
  currentPage,
  storeTypes = [],
  currentType,
  translations: t,
}: StoreListClientProps) {
  const router = useRouter();

  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (currentType) params.set("type", currentType);
    const query = params.toString();
    return `/magazalar${query ? `?${query}` : ""}`;
  }

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    const params = new URLSearchParams();
    if (val) params.set("type", val);
    const query = params.toString();
    router.push(`/magazalar${query ? `?${query}` : ""}`);
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-primary">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{t.stores}</span>
      </nav>

      {/* Title Bar — Store icon + title left, type dropdown right */}
      <div className="mb-6 flex items-center justify-between rounded-xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-6 w-6 text-foreground" />
          <h1 className="text-xl font-bold text-foreground">{t.stores}</h1>
        </div>

        {/* Store Type Dropdown */}
        <select
          value={currentType || ""}
          onChange={handleTypeChange}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">---{t.select_type}---</option>
          {storeTypes.map((type) => (
            <option key={type.id} value={type.value || String(type.id)}>
              {type.label || type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Store Grid — 4 columns */}
      {stores.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

/* ── Store Card — matches reference design ── */
function StoreCard({
  store,
  translations: t,
}: {
  store: Store;
  translations: StoreListTranslations;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
      {/* Logo — centered circle */}
      <div className="relative mb-4 h-[80px] w-[80px] shrink-0 overflow-hidden rounded-full border-2 border-border/50 bg-background">
        {store.logo_url ? (
          <Image
            src={store.logo_url}
            alt={store.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-xl font-bold text-muted-foreground">
            {store.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Store Name */}
      <h3 className="mb-4 text-center text-base font-bold text-foreground">
        {store.name}
      </h3>

      {/* Contact Info */}
      <div className="mb-5 w-full space-y-2.5">
        {/* Phone */}
        {store.phone && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Image src="/assets/icons/suport_ticket.png" alt="" width={20} height={20} className="h-5 w-5 shrink-0" />
            <span className="truncate">{store.phone}</span>
          </div>
        )}

        {/* Email — email.png is white template, apply CSS filter to colorize blue */}
        {store.email && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Image
              src="/assets/icons/email.png"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 brightness-0 saturate-100"
              style={{ filter: "invert(42%) sepia(93%) saturate(1352%) hue-rotate(196deg) brightness(97%) contrast(101%)" }}
            />
            <span className="truncate">{store.email}</span>
          </div>
        )}

        {/* Address */}
        {store.address && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Image src="/assets/icons/address.png" alt="" width={20} height={20} className="h-5 w-5 shrink-0" />
            <span className="line-clamp-1">{store.address}</span>
          </div>
        )}
      </div>

      {/* Visit Store Button */}
      <Link
        href={`/magaza/${store.slug}`}
        className="mt-auto rounded-full bg-primary px-8 py-2 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t.view_store}
      </Link>
    </div>
  );
}
