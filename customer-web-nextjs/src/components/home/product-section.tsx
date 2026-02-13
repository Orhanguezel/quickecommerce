"use client";

import { useRef } from "react";
import type { Product } from "@/modules/product/product.type";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "./section-header";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <SectionHeader title={title} subtitle={subtitle} viewAllHref={viewAllHref} />

      <div className="group/section relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md opacity-0 transition-opacity hover:bg-muted group-hover/section:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Products Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background shadow-md opacity-100 transition-opacity hover:bg-muted group-hover/section:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
