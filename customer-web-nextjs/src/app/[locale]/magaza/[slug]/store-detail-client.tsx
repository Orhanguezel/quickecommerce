"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
} from "lucide-react";
import type { StoreDetail } from "@/modules/store/store.type";
import { ProductCard } from "@/components/product/product-card";

interface StoreDetailTranslations {
  stores: string;
  details: string;
  all_products: string;
  featured_products: string;
  products: string;
  delivery_time: string;
  delivery_time_min: string;
  open_hours: string;
  closed_day: string;
  contact: string;
  member_since: string;
  started_from: string;
  reviews: string;
  no_products: string;
  home: string;
  add_to_cart: string;
}

interface StoreDetailClientProps {
  store: StoreDetail;
  translations: StoreDetailTranslations;
}

export function StoreDetailClient({
  store,
  translations: t,
}: StoreDetailClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "featured">(
    store.featured_products.length > 0 ? "featured" : "all"
  );

  const products =
    activeTab === "featured" ? store.featured_products : store.all_products;
  const hasFeatured = store.featured_products.length > 0;

  return (
    <div className="container py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/magazalar" className="hover:text-foreground">
          {t.stores}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary">{t.details}</span>
      </nav>

      {/* ── Hero Banner ── */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-slate-800">
        {/* Background image (faded) */}
        {store.banner_url && (
          <Image
            src={store.banner_url}
            alt=""
            fill
            className="object-cover opacity-20"
            priority
          />
        )}

        <div className="relative flex min-h-[220px] items-center justify-between gap-6 p-6 sm:min-h-[260px] sm:p-8 lg:p-10">
          {/* Left: Store info */}
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Logo */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-white/10 sm:h-20 sm:w-20">
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {/* Name */}
              <h1 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                {store.name}
              </h1>

              {/* Contact info */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/80">
                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {store.phone}
                  </a>
                )}
                {store.email && (
                  <a
                    href={`mailto:${store.email}`}
                    className="flex items-center gap-1.5 hover:text-white"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {store.email}
                  </a>
                )}
              </div>

              {/* Address */}
              {store.address && (
                <div className="flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{store.address}</span>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(store.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-white/20 text-white/20"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm text-white/70">
                  ({store.total_product})
                </span>
              </div>
            </div>
          </div>

          {/* Right: Started from (bottom-right) */}
          {store.started_from && (
            <span className="absolute bottom-4 right-6 text-sm text-white/60 sm:bottom-6 sm:right-8">
              {t.started_from}: {store.started_from}
            </span>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mb-6 flex justify-end gap-2">
        {hasFeatured && (
          <button
            onClick={() => setActiveTab("featured")}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "featured"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            {t.featured_products}
          </button>
        )}
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {t.all_products}
        </button>
      </div>

      {/* ── Products Grid ── */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t.no_products}</p>
        </div>
      )}
    </div>
  );
}
