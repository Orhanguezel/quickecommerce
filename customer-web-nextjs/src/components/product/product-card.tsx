"use client";

import type { Product } from "@/modules/product/product.type";
import { Link } from "@/i18n/routing";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistToggleMutation } from "@/modules/wishlist/wishlist.service";
import Image from "next/image";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("product");
  const price = product.price != null ? Number(product.price) : null;
  const specialPrice = product.special_price != null ? Number(product.special_price) : null;
  const hasDiscount = specialPrice != null && price != null && specialPrice < price;
  const displayPrice = hasDiscount ? specialPrice : price;

  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const wishlistToggle = useWishlistToggleMutation();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayPrice == null) return;
    const cartItem: CartItem = {
      id: product.id,
      product_id: product.id,
      store_id: product.store_id ?? undefined,
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
    if (!isAuthenticated) return;
    wishlistToggle.mutate(product.id);
  };

  const isInStock = product.stock === null || product.stock > 0;

  return (
    <Link
      href={`/urun/${product.slug}`}
      className="group relative flex w-[220px] shrink-0 flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg sm:w-[240px]"
    >
      {/* Image Area */}
      <div className="relative flex h-[200px] items-center justify-center bg-muted/30 p-4">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="240px"
            className="object-contain p-4 transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {/* Featured Badge - top left */}
        {product.is_featured && (
          <span className="absolute left-2 top-2 rounded bg-teal-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            Featured
          </span>
        )}

        {/* Discount Badge - top right */}
        {hasDiscount && product.discount_percentage > 0 && (
          <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-sm">
            {Math.round(product.discount_percentage)}%
          </span>
        )}

        {/* Wishlist Button - hover */}
        {isAuthenticated && (
          <button
            onClick={handleWishlistToggle}
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow opacity-0 transition-all hover:bg-white group-hover:opacity-100"
          >
            <Heart
              className={`h-4 w-4 ${product.wishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3.5 w-3.5 ${
                star <= Math.round(parseFloat(product.rating || "0"))
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
          <span className="ml-0.5 text-xs text-muted-foreground">
            ({product.review_count})
          </span>
        </div>

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {product.name}
        </h3>

        {/* Stock Status */}
        {isInStock ? (
          <span className="text-xs font-medium text-emerald-600">
            {t("in_stock")}
          </span>
        ) : (
          <span className="text-xs font-medium text-red-500">
            {t("out_of_stock")}
          </span>
        )}

        {/* Price + Add Button */}
        <div className="mt-auto flex items-end justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-foreground">
              {displayPrice != null ? `$${displayPrice.toFixed(2)}` : ""}
            </span>
            {hasDiscount && price != null && (
              <span className="text-xs text-muted-foreground line-through">
                ${price.toFixed(2)}
              </span>
            )}
          </div>

          {displayPrice != null && isInStock && (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
