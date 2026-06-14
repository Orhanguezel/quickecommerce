"use client";

import { useState, useEffect } from "react";

import type { Product } from "@/modules/product/product.type";
import { Link, useRouter } from "@/i18n/routing";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  useWishlistRemoveMutation,
  useWishlistToggleMutation,
} from "@/modules/wishlist/wishlist.service";
import Image from "next/image";
import { Star, Heart, Eye, Zap, Flame, Award, PackageX } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePrice } from "@/hooks/use-price";
import { useRef } from "react";
import { flyToCart } from "@/lib/cart-animation";
import { resolveProductPricing } from "@/lib/product-pricing";
import { trackFunnelEvent } from "@/lib/funnel-tracker";

interface ProductCardProps {
  product: Product;
  /** compact: fills parent (grid cell). default: fixed 250x316 (scroll). */
  compact?: boolean;
  /** variant: "grid" (vertical card) or "list" (horizontal card) */
  variant?: "grid" | "list";
  /** Recommendation block context, used to attribute add-to-cart events. */
  recommendationBlockType?: string;
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

export function ProductCard({
  product,
  compact = false,
  variant = "grid",
  recommendationBlockType,
}: ProductCardProps) {
  const t = useTranslations("product");
  const { formatPrice } = usePrice();
  const { originalPrice: price, displayPrice, hasDiscount } =
    resolveProductPricing(product, product.default_variant_id);

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const wishlistToggle = useWishlistToggleMutation();
  const wishlistRemove = useWishlistRemoveMutation();
  const [isWishlisted, setIsWishlisted] = useState(Boolean(product.wishlist));

  const [mounted, setMounted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const isInStock = product.stock === null || product.stock > 0;
  // Gercek (int) miktar veren kaynaklarda (provitanya/swan) dusuk stokta sayiyi
  // goster ("Stokta (3)" -> kitlik). Bool kaynaklarda stok sembolik (1) oldugu
  // icin sayi gizlenir. Yuksek stokta sayi sizdirmamak icin esik.
  const STOCK_COUNT_MAX = 20;
  const stockCount = typeof product.stock === "number" ? product.stock : null;
  const showStockCount =
    !!product.stock_is_exact &&
    stockCount !== null &&
    stockCount > 0 &&
    stockCount <= STOCK_COUNT_MAX;

  useEffect(() => {
    setMounted(true);
  }, []);
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock || displayPrice == null || displayPrice <= 0) return;
    const defaultVariant = product.singleVariant?.[0];
    const variantId = defaultVariant?.id ?? product.default_variant_id;
    const cartItem: CartItem = {
      id: product.id,
      product_id: product.id,
      variant_id: variantId,
      store_id: product.store_id ?? product.store?.id ?? undefined,
      name: product.name,
      slug: product.slug,
      image: product.image_url || "",
      price: displayPrice,
      original_price: price ?? undefined,
      quantity: 1,
      max_cart_qty: product.max_cart_qty || 99,
    };
    addItem(cartItem);
    trackFunnelEvent({
      event: "add_to_cart",
      product_id: product.id,
      amount: displayPrice,
      meta: {
        source: "product_card",
        slug: product.slug,
        quantity: 1,
      },
    });

    if (recommendationBlockType) {
      trackFunnelEvent({
        event: "recommendation_add",
        block_type: recommendationBlockType,
        product_id: product.id,
        amount: displayPrice,
        meta: {
          slug: product.slug,
          quantity: 1,
        },
      });
    }
    
    // Fly to cart animation
    if (imageRef.current) {
      const img = imageRef.current.querySelector("img");
      const rect = imageRef.current.getBoundingClientRect();
      flyToCart(img, rect);
    }

    openDrawer();
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push("/giris");
      return;
    }

    const previous = isWishlisted;
    setIsWishlisted(!previous);

    const mutation = previous ? wishlistRemove : wishlistToggle;
    mutation.mutate(product.id, {
      onError: () => setIsWishlisted(previous),
    });
  };

  const ratingNum = Number(product.rating) || 0;
  const reviewCount = product.review_count || 0;

  /* ── Best seller check ── */
  const isBestSeller = (product.order_count ?? 0) >= 10;

  /* ── Featured badge (shared) ── */
  const featuredBadge = product.is_featured ? (
    <span className="absolute left-2 top-2.5 z-10 flex items-center gap-1 rounded bg-gradient-to-r from-blue-700 to-blue-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
      <Award className="h-2.5 w-2.5" />
      Sporcunun Seçimi
    </span>
  ) : null;

  /* ── Best seller badge (shared) ── */
  const bestSellerBadge = isBestSeller ? (
    <span className={`absolute left-2 ${product.is_featured ? "top-7" : "top-2.5"} z-10 flex items-center gap-1 rounded bg-gradient-to-r from-orange-600 to-amber-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm`}>
      <Flame className="h-2.5 w-2.5" />
      Çok Satan
    </span>
  ) : null;

  /* ── Flash sale computed discount % ── */
  const flashSaleDiscountPct =
    product.flash_sale && product.flash_sale.discount_type === "percentage" && product.flash_sale.discount_amount > 0
      ? Math.round(product.flash_sale.discount_amount)
      : null;
  const displayDiscountPct = flashSaleDiscountPct ?? Math.round(product.discount_percentage);
  const flashSaleFixedDiscountText =
    product.flash_sale &&
    product.flash_sale.discount_type === "amount" &&
    Number(product.flash_sale.discount_amount) > 0
      ? `${Number(product.flash_sale.discount_amount)} TL`
      : null;
  const discountText =
    flashSaleFixedDiscountText ??
    (displayDiscountPct > 0 ? `%${displayDiscountPct}` : null);

  /* ── Discount badge (shared) ── */
  const discountBadge =
    isInStock && hasDiscount && discountText ? (
      <span className="absolute right-2 top-2.5 z-10 flex items-center gap-0.5 rounded bg-[#EB5A25] px-1.5 py-0.5 text-xs font-bold text-white">
        {flashSaleDiscountPct != null && <Zap className="h-2.5 w-2.5 fill-white" />}
        {discountText}
      </span>
    ) : null;

  /* ── Flash sale strip (bottom of image, grid only) ── */
  const flashSaleStrip = isInStock && product.flash_sale ? (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 py-1.5">
      <Zap className="h-3 w-3 fill-white text-white" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-white">
        Flash Satış
      </span>
    </div>
  ) : null;

  /* ── Flash sale badge (list variant) ── */
  const flashSaleListBadge = isInStock && product.flash_sale ? (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-orange-500 py-1">
      <Zap className="h-2.5 w-2.5 fill-white text-white" />
      <span className="text-[11px] font-bold uppercase text-white">Flash</span>
    </div>
  ) : null;

  /* ── Product image ── */
  // Bazi 3.taraf kaynaklarin CORP/hotlink korumasi (ornegin Compex Cloudflare)
  // remote URL'i browser'a yukletmiyor. SSR'da bilinen domain'leri direkt
  // placeholder'a yonlendir; ayrica onError handler ile yedek koruma.
  const PLACEHOLDER = "/images/product-placeholder.svg";
  const BLOCKED_IMAGE_DOMAINS = ["compexturkiye.com"];
  const isBlockedRemoteSrc =
    !!product.image_url &&
    BLOCKED_IMAGE_DOMAINS.some((d) => product.image_url!.includes(d));
  const shouldShowPlaceholder =
    !product.image_url || imageError || isBlockedRemoteSrc;
  const productImage = !shouldShowPlaceholder ? (
    <Image
      src={product.image_url!}
      alt={product.name}
      fill
      sizes={
        variant === "list"
          ? "130px"
          : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      }
      className="object-cover"
      unoptimized
      onError={() => setImageError(true)}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <Image
        src={PLACEHOLDER}
        alt={product.name}
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  );

  /* ── Stock label ── */
  const stockLabel = isInStock ? (
    <span className="text-xs font-medium text-green-600 dark:text-green-400">
      {showStockCount ? `${t("in_stock")} (${stockCount})` : t("in_stock")}
    </span>
  ) : (
    <span className="text-xs font-medium text-red-500 dark:text-red-400">
      {t("out_of_stock")}
    </span>
  );

  const outOfStockOverlay = !isInStock ? (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
      <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        <PackageX className="h-3.5 w-3.5" />
        {t("out_of_stock")}
      </span>
    </div>
  ) : null;

  /* ── Price display ── */
  const priceDisplay = (
    <div className={`flex items-baseline gap-2 ${!isInStock ? "opacity-70" : ""}`}>
      {hasDiscount && price != null ? (
        <>
          <span className="text-sm font-bold text-primary">
            {mounted ? formatPrice(displayPrice!) : displayPrice!.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            {mounted ? formatPrice(price) : price.toFixed(2)}
          </span>
        </>
      ) : (
        <span className="text-sm font-bold text-primary">
          {displayPrice != null ? (mounted ? formatPrice(displayPrice) : displayPrice.toFixed(2)) : ""}
        </span>
      )}
    </div>
  );

  const handleProductClick = () => {
    trackFunnelEvent({
      event: "product_click",
      product_id: product.id,
      amount: displayPrice ?? undefined,
      meta: {
        slug: product.slug,
        source: "product_card",
        variant,
      },
    });
  };

  /* ── Cart button icon (using cart.png) ── */
  const cartIconButton = isInStock && displayPrice != null && displayPrice > 0 ? (
    <div className="relative">
      {isAdding && (
        <span className="animate-cart-pop pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 z-20 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
          +1
        </span>
      )}
      <button
        onClick={handleAddToCart}
        title={t("add_to_cart")}
        aria-label={t("add_to_cart")}
        className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md border bg-card transition-all hover:border-primary hover:bg-primary/5 ${isAdding ? "scale-90" : "scale-100"}`}
      >
        <Image
          src="/assets/icons/cart.png"
          alt="Cart"
          width={18}
          height={18}
          unoptimized
        />
      </button>
    </div>
  ) : null;

  /* ════════════════════════════════════
     LIST VARIANT — horizontal card
     ════════════════════════════════════ */
  if (variant === "list") {
    return (
      <Link
      href={`/urun/${product.slug}`}
      title={product.name}
      onClick={handleProductClick}
      className="group flex items-stretch overflow-hidden rounded-lg border bg-card transition-all hover:border-primary/50 hover:shadow-md"
      >
        {/* Image */}
        <div className="relative h-[140px] w-[140px] shrink-0 overflow-hidden bg-muted" ref={imageRef}>
          {productImage}
          {featuredBadge}
          {bestSellerBadge}
          {discountBadge}
          {flashSaleListBadge}
          {outOfStockOverlay}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between p-3.5">
          <div className="space-y-1.5">
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
              {product.name}
            </h3>
            <StarRating rating={ratingNum} count={reviewCount} />
            {stockLabel}
          </div>

          <div className="flex items-end justify-between">
            {priceDisplay}
            {cartIconButton}
          </div>
        </div>
      </Link>
    );
  }

  /* ════════════════════════════════════
     GRID VARIANT — vertical card
     ════════════════════════════════════ */
  return (
    <Link
      href={`/urun/${product.slug}`}
      title={product.name}
      onClick={handleProductClick}
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-lg ${
        compact ? "h-full w-full" : "h-[380px] w-[260px] shrink-0"
      }`}
    >
      {/* Image Area */}
      <div
        ref={imageRef}
        className={`relative w-full overflow-hidden bg-muted ${
          compact ? "aspect-[3/4]" : "flex-1"
        }`}
      >
        {productImage}
        {featuredBadge}
        {bestSellerBadge}
        {discountBadge}
        {flashSaleStrip}
        {outOfStockOverlay}

        {/* Hover action buttons */}
        <div className="absolute bottom-11 left-0 right-0 z-20 flex items-center justify-center gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border bg-card shadow-sm">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          {isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              type="button"
              aria-label={isWishlisted ? t("remove_from_wishlist") : t("add_to_wishlist")}
              title={isWishlisted ? t("remove_from_wishlist") : t("add_to_wishlist")}
              disabled={wishlistToggle.isPending || wishlistRemove.isPending}
              className="flex h-8 w-8 items-center justify-center rounded-md border bg-card shadow-sm"
            >
              <Heart
                className={`h-3.5 w-3.5 ${
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1 p-2 sm:gap-1.5 sm:p-3">
        <h3 className="line-clamp-2 text-xs font-semibold text-foreground sm:line-clamp-1 sm:text-sm">
          {product.name}
        </h3>

        <StarRating rating={ratingNum} count={reviewCount} />

        {stockLabel}

        <div className="flex items-end justify-between pt-0.5">
          {priceDisplay}
          {cartIconButton}
        </div>
      </div>
    </Link>
  );
}
