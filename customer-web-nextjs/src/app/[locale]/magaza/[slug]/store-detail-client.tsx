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
  Clock,
  CalendarOff,
  Truck,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import type { StoreDetail } from "@/modules/store/store.type";
import { ProductCard } from "@/components/product/product-card";

interface StoreDetailTranslations {
  stores: string;
  all_products: string;
  featured_products: string;
  products: string;
  delivery_time: string;
  delivery_time_min: string;
  open_hours: string;
  closed_day: string;
  contact: string;
  member_since: string;
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
  const [activeTab, setActiveTab] = useState<"all" | "featured">("all");

  const products = activeTab === "featured" ? store.featured_products : store.all_products;
  const hasFeatured = store.featured_products.length > 0;

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 bg-muted sm:h-56">
        {store.banner_url ? (
          <Image
            src={store.banner_url}
            alt={store.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full bg-gradient-to-r from-primary/10 to-primary/5" />
        )}
      </div>

      <div className="container">
        {/* Store Header */}
        <div className="-mt-10 mb-6 flex items-end gap-4 sm:-mt-12">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-4 border-background bg-background shadow-md sm:h-24 sm:w-24">
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

          <div className="pb-1">
            {/* Breadcrumb */}
            <nav className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                {t.home}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/magazalar" className="hover:text-foreground">
                {t.stores}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{store.name}</span>
            </nav>

            <h1 className="text-xl font-bold sm:text-2xl">{store.name}</h1>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {store.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{store.rating.toFixed(1)}</span>
                </div>
              )}
              <span>{store.total_product} {t.products}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main content */}
          <div>
            {/* Tabs */}
            <div className="mb-4 flex gap-2 border-b">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.all_products} ({store.all_products.length})
              </button>
              {hasFeatured && (
                <button
                  onClick={() => setActiveTab("featured")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "featured"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.featured_products} ({store.featured_products.length})
                </button>
              )}
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">{t.no_products}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Store Info Card */}
            <div className="rounded-lg border p-4">
              <h2 className="mb-3 font-semibold">{t.contact}</h2>
              <div className="space-y-2.5 text-sm">
                {store.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <a href={`tel:${store.phone}`} className="hover:text-foreground">
                      {store.phone}
                    </a>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <a href={`mailto:${store.email}`} className="hover:text-foreground">
                      {store.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Hours & Delivery */}
            <div className="rounded-lg border p-4">
              <div className="space-y-2.5 text-sm">
                {store.opening_time && store.closing_time && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>
                      {t.open_hours}: {store.opening_time} - {store.closing_time}
                    </span>
                  </div>
                )}
                {store.off_day && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarOff className="h-4 w-4 shrink-0" />
                    <span>
                      {t.closed_day}: {store.off_day}
                    </span>
                  </div>
                )}
                {store.delivery_time && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-4 w-4 shrink-0" />
                    <span>
                      {t.delivery_time}: {store.delivery_time} {t.delivery_time_min}
                    </span>
                  </div>
                )}
                {store.started_from && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      {t.member_since}: {store.started_from}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
