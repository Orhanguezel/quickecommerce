"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/modules/product/product.type";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "./section-header";
import { trackViewItemList } from "@/lib/gtm";
import { resolveProductPricing } from "@/lib/product-pricing";
import { trackFunnelEvent } from "@/lib/funnel-tracker";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  analyticsBlockType?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  analyticsBlockType,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackedKeyRef = useRef("");

  useEffect(() => {
    const key = `${title}:${products.map((product) => product.id).join(",")}`;
    if (!products.length || trackedKeyRef.current === key) return;
    trackedKeyRef.current = key;
    trackViewItemList(products.map((product) => ({
      item_id: String(product.id),
      item_name: product.name,
      price: resolveProductPricing(product, product.default_variant_id).displayPrice ?? undefined,
      quantity: 1,
    })), title);
    if (analyticsBlockType) {
      products.forEach((product) => {
        trackFunnelEvent({
          event: "recommendation_view",
          block_type: analyticsBlockType,
          product_id: product.id,
          meta: { item_list_name: title },
        });
      });
    }
  }, [analyticsBlockType, products, title]);

  if (!products.length) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 260;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
        onPrev={() => scroll("left")}
        onNext={() => scroll("right")}
      />

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide"
        >
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              itemListName={title}
              itemIndex={index}
              recommendationBlockType={analyticsBlockType}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
