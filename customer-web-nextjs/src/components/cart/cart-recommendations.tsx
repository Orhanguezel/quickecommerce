"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ShoppingBasket, TrendingUp, Heart } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { useCartStore } from "@/stores/cart-store";
import { useCartRecommendations } from "@/modules/cart/cart-recommendation.service";
import type { CartRecommendationBlock } from "@/modules/cart/cart-recommendation.type";
import { trackFunnelEvent } from "@/lib/funnel-tracker";

interface CartRecommendationsProps {
  /** Visual density. Cart page uses "full", drawer could use "compact" (smaller) */
  variant?: "full" | "compact";
  /** Max blocks to render (mirrors the backend option) */
  maxBlocks?: number;
}

/**
 * Fetches and renders all recommendation blocks for the current cart.
 * Internally calls POST /api/v1/cart/recommendations.
 *
 * Each block is rendered as a horizontally-scrollable ProductCard carousel,
 * consistent with homepage sections.
 */
export function CartRecommendations({
  variant = "full",
  maxBlocks = 3,
}: CartRecommendationsProps) {
  const items = useCartStore((s) => s.items);
  const cartItems = items.map((i) => ({
    product_id: i.product_id,
    variant_id: i.variant_id ?? null,
    quantity: i.quantity,
    price: i.price,
  }));

  const { data, isPending } = useCartRecommendations({
    cartItems,
    enabled: cartItems.length > 0,
    maxBlocks,
    productsPerBlock: variant === "compact" ? 8 : 10,
  });

  if (cartItems.length === 0) return null;
  if (isPending) return null;
  const blocks = data?.blocks ?? [];
  if (blocks.length === 0) return null;

  return (
    <div className={variant === "full" ? "space-y-10" : "space-y-6"}>
      {blocks.map((block) => (
        <CartRecommendationBlockView
          key={`${block.type}_${block.priority}`}
          block={block}
          variant={variant}
        />
      ))}
    </div>
  );
}

function iconForBlock(type: string) {
  if (type === "frequently_bought_together") return ShoppingBasket;
  if (type === "wishlist_triggered") return Heart;
  if (type === "category_popular") return TrendingUp;
  return TrendingUp;
}

function CartRecommendationBlockView({
  block,
  variant,
}: {
  block: CartRecommendationBlock;
  variant: "full" | "compact";
}) {
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const Icon = iconForBlock(block.type);

  // Fire a single "recommendation_shown" impression the first time this
  // block renders. Product IDs shipped in meta so admin can slice by item.
  useEffect(() => {
    if (firedRef.current) return;
    if (!block.products?.length) return;
    firedRef.current = true;
    trackFunnelEvent({
      event: "recommendation_shown",
      block_type: block.type,
      meta: {
        product_ids: block.products.map((p) => p.id),
        count: block.products.length,
      },
    });
  }, [block.type]); // eslint-disable-line react-hooks/exhaustive-deps

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  // Translation keys are sent from backend with a namespace prefix —
  // e.g. "recommendations.frequently_bought_together". Fall back to the
  // raw key so missing translations don't break the UI.
  const title = (() => {
    try {
      return t(block.title_key);
    } catch {
      return block.title_key;
    }
  })();

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-white shadow-sm">
            <Icon className="h-4 w-4" />
          </span>
          <h3
            className={
              variant === "full"
                ? "text-lg font-semibold tracking-tight"
                : "text-base font-semibold tracking-tight"
            }
          >
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Geri"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 text-foreground transition-colors hover:bg-primary hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="İleri"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 text-foreground transition-colors hover:bg-primary hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide"
      >
        {block.products.map((product) => (
          <div
            key={product.id}
            onClickCapture={() =>
              trackFunnelEvent({
                event: "recommendation_clicked",
                block_type: block.type,
                product_id: product.id,
              })
            }
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
