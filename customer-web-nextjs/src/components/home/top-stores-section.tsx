"use client";

import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { Store } from "lucide-react";
import Image from "next/image";
import { useTopStoresQuery } from "@/modules/store/store.action";
import type { Store as StoreType } from "@/modules/store/store.type";
import { SectionHeader } from "./section-header";
import { useTranslations } from "next-intl";

interface TopStoresSectionProps {
  title: string;
}

/* Cycling pastel card colors — bg + button accent */
const CARD_COLORS = [
  { bg: "#FFF0F0", btn: "#8BC34A", btnText: "#fff" },
  { bg: "#FFF3E0", btn: "#FF9800", btnText: "#fff" },
  { bg: "#E8F5E9", btn: "#4CAF50", btnText: "#fff" },
  { bg: "#F3E5F5", btn: "#9C27B0", btnText: "#fff" },
  { bg: "#F5F5F5", btn: "#9E9E9E", btnText: "#fff" },
  { bg: "#E3F2FD", btn: "#2196F3", btnText: "#fff" },
];

export function TopStoresSection({ title }: TopStoresSectionProps) {
  const t = useTranslations("store");
  const { data, isPending: isLoading } = useTopStoresQuery(6);
  const stores: StoreType[] = (data as { data?: StoreType[] })?.data ?? [];

  if (!isLoading && stores.length === 0) return null;

  if (isLoading) {
    return (
      <section>
        <SectionHeader title={title} viewAllHref={ROUTES.STORES} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[180px] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title={title} viewAllHref={ROUTES.STORES} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {stores.map((store, index) => {
          const color = CARD_COLORS[index % CARD_COLORS.length];
          return (
            <Link
              key={store.id}
              href={ROUTES.STORE_DETAIL(store.slug)}
              className="group flex flex-col items-center rounded-xl px-4 py-6 transition-shadow hover:shadow-md"
              style={{ backgroundColor: color.bg }}
            >
              {/* Store Logo */}
              <div className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full">
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white/60">
                    <Store className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Store Name */}
              <h3 className="mb-4 text-center text-sm font-semibold text-foreground">
                {store.name}
              </h3>

              {/* Visit Store Button */}
              <span
                className="mt-auto rounded-md px-4 py-1.5 text-xs font-medium transition-opacity group-hover:opacity-90"
                style={{ backgroundColor: color.btn, color: color.btnText }}
              >
                {t("view_store")}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
