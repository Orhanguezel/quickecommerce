"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import { SectionHeader } from "./section-header";
import { usePrice } from "@/hooks/use-price";

interface RecentlyViewedSectionProps {
  title?: string;
  subtitle?: string;
  /** Product IDs to hide from the list (e.g. items already in cart) */
  excludeIds?: number[];
  /** Max items to show (default 20 — store's internal max) */
  maxItems?: number;
}

export function RecentlyViewedSection({
  title = "Son Görüntülenen",
  subtitle,
  excludeIds,
  maxItems,
}: RecentlyViewedSectionProps) {
  const allItems = useRecentlyViewedStore((s) => s.items);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = usePrice();

  const excludeSet = new Set(excludeIds ?? []);
  const items = allItems
    .filter((i) => !excludeSet.has(i.id))
    .filter((i) => {
      const hasDiscount =
        i.special_price != null &&
        i.price != null &&
        i.special_price < i.price;
      const displayPrice = hasDiscount ? i.special_price : i.price;
      return displayPrice != null && displayPrice > 0;
    })
    .slice(0, maxItems ?? allItems.length);

  if (!items.length) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        onPrev={() => scroll("left")}
        onNext={() => scroll("right")}
      />

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide"
        >
          {items.map((item) => {
            const hasDiscount =
              item.special_price != null &&
              item.price != null &&
              item.special_price < item.price;
            const displayPrice = hasDiscount
              ? item.special_price!
              : item.price ?? 0;

            return (
              <Link
                key={item.id}
                href={`/urun/${item.slug}`}
                className="group flex w-[170px] shrink-0 flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md sm:w-[200px]"
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Clock className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  {item.discount_percentage > 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-red-700 px-1.5 py-0.5 text-xs font-bold text-white">
                      -{Math.round(item.discount_percentage)}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1 p-2.5">
                  <span className="line-clamp-2 text-sm font-medium leading-tight text-foreground group-hover:text-primary">
                    {item.name}
                  </span>
                  <div className="mt-auto flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(displayPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(item.price!)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
