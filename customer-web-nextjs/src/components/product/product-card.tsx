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
import { Star, Heart, Eye, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePrice } from "@/hooks/use-price";

interface ProductCardProps {
  product: Product;
  /** compact: fills parent (grid cell). default: fixed 250x316 (scroll). */
  compact?: boolean;
  /** variant: "grid" (vertical card) or "list" (horizontal card) */
  variant?: "grid" | "list";
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
      <span className="text-[11px] text-muted-foreground">({count})</span>
    </div>
  );
}

export function ProductCard({
  product,
  compact = false,
  variant = "grid",
}: ProductCardProps) {
  const t = useTranslations("product");
  const { formatPrice } = usePrice();
  const price = product.price != null ? Number(product.price) : null;
  const specialPrice =
    product.special_price != null && Number(product.special_price) > 0
      ? Number(product.special_price)
      : null;
  const hasSpecialPriceDiscount =
    specialPrice != null && price != null && specialPrice < price;
  let displayPrice: number | null = hasSpecialPriceDiscount ? specialPrice : price;
  if (displayPrice != null && product.flash_sale && product.flash_sale.discount_amount > 0) {
    const fs = product.flash_sale;
    const fsDiscount =
      fs.discount_type === "percentage"
        ? Math.round((displayPrice * fs.discount_amount) / 100)
        : fs.discount_amount;
    displayPrice = Math.max(0, displayPrice - fsDiscount);
  }
  const hasDiscount = displayPrice != null && price != null && displayPrice < price;

  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const wishlistToggle = useWishlistToggleMutation();
  const wishlistRemove = useWishlistRemoveMutation();
  const [isWishlisted, setIsWishlisted] = useState(Boolean(product.wishlist));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayPrice == null) return;
    const defaultVariant = product.singleVariant?.[0];
    // Multi-variant products: go to detail page to pick variant
    if (!defaultVariant) {
      router.push(`/urun/${product.slug}`);
      return;
    }
    const cartItem: CartItem = {
      id: product.id,
      product_id: product.id,
      variant_id: defaultVariant.id,
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

  const isInStock = product.stock === null || product.stock > 0;
  const ratingNum = Number(product.rating) || 0;
  const reviewCount = product.review_count || 0;

  /* ── Featured badge (shared) ── */
  const featuredBadge = product.is_featured ? (
    <div className="absolute left-0 top-2.5 z-10">
      <div className="relative flex h-[22px] w-[78px] items-center">
        <Image
          src="/assets/images/featured.png"
          alt=""
          fill
          className="object-contain object-left"
          unoptimized
        />
        <span className="relative z-10 pl-2 text-[10px] font-bold text-white">
          {t("featured")}
        </span>
      </div>
    </div>
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
    hasDiscount && discountText ? (
      <span className="absolute right-2 top-2.5 z-10 flex items-center gap-0.5 rounded bg-[#EB5A25] px-1.5 py-0.5 text-[11px] font-bold text-white">
        {flashSaleDiscountPct != null && <Zap className="h-2.5 w-2.5 fill-white" />}
        {discountText}
      </span>
    ) : null;

  /* ── Flash sale strip (bottom of image, grid only) ── */
  const flashSaleStrip = product.flash_sale ? (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 py-1.5">
      <Zap className="h-3 w-3 fill-white text-white" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-white">
        Flash Satış
      </span>
    </div>
  ) : null;

  /* ── Flash sale badge (list variant) ── */
  const flashSaleListBadge = product.flash_sale ? (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-1 bg-gradient-to-r from-red-600 to-orange-500 py-1">
      <Zap className="h-2.5 w-2.5 fill-white text-white" />
      <span className="text-[9px] font-bold uppercase text-white">Flash</span>
    </div>
  ) : null;

  /* ── Product image ── */
  const productImage = product.image_url ? (
    <Image
      src={product.image_url}
      alt={product.name}
      fill
      sizes={
        variant === "list"
          ? "130px"
          : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      }
      className="object-cover"
      unoptimized
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
      No Image
    </div>
  );

  /* ── Stock label ── */
  const stockLabel = isInStock ? (
    <span className="text-xs font-medium text-green-600 dark:text-green-400">
      {t("in_stock")}
    </span>
  ) : (
    <span className="text-xs font-medium text-red-500 dark:text-red-400">
      {t("out_of_stock")}
    </span>
  );

  /* ── Price display ── */
  const priceDisplay = (
    <div className="flex items-baseline gap-2">
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

  /* ── Cart button icon (using cart.png) ── */
  const cartIconButton = isInStock && displayPrice != null ? (
    <button
      onClick={handleAddToCart}
      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md border bg-card transition-colors hover:border-primary hover:bg-primary/5"
    >
      <Image
        src="/assets/icons/cart.png"
        alt="Cart"
        width={18}
        height={18}
        unoptimized
      />
    </button>
  ) : null;

  /* ════════════════════════════════════
     LIST VARIANT — horizontal card
     ════════════════════════════════════ */
  if (variant === "list") {
    return (
      <Link
        href={`/urun/${product.slug}`}
        className="group flex items-stretch overflow-hidden rounded-lg border bg-card transition-all hover:border-primary/50 hover:shadow-md"
      >
        {/* Image */}
        <div className="relative h-[140px] w-[140px] shrink-0 overflow-hidden bg-muted">
          {productImage}
          {featuredBadge}
          {discountBadge}
          {flashSaleListBadge}
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
      className={`group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-lg ${
        compact ? "h-full w-full" : "h-[380px] w-[260px] shrink-0"
      }`}
    >
      {/* Image Area */}
      <div
        className={`relative w-full overflow-hidden bg-muted ${
          compact ? "aspect-[4/3]" : "flex-1"
        }`}
      >
        {productImage}
        {featuredBadge}
        {discountBadge}
        {flashSaleStrip}

        {/* Hover action buttons */}
        <div className="absolute bottom-11 left-0 right-0 z-20 flex items-center justify-center gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border bg-card shadow-sm">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          {isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              type="button"
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
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
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
