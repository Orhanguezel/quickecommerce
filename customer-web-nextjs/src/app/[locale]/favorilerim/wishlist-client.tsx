"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import {
  useWishlistQuery,
  useWishlistRemoveMutation,
} from "@/modules/wishlist/wishlist.service";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Props {
  translations: {
    wishlist: string;
    home: string;
    no_data: string;
    loading: string;
    error: string;
    remove_from_wishlist: string;
    add_to_cart: string;
    currency: string;
    previous: string;
    next: string;
    page: string;
  };
}

export function WishlistClient({ translations: t }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useWishlistQuery(page);
  const removeMutation = useWishlistRemoveMutation();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (product: any) => {
    const price =
      product.special_price != null
        ? Number(product.special_price)
        : Number(product.price);
    const cartItem: CartItem = {
      id: product.id,
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image_url || "",
      price,
      original_price: Number(product.price),
      quantity: 1,
      max_cart_qty: product.max_cart_qty || 99,
    };
    addItem(cartItem);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{t.error}</p>
      </div>
    );
  }

  const wishlist = data?.wishlist ?? [];
  const totalPages = data?.meta?.last_page ?? 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t.wishlist}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">
        <Heart className="mr-2 inline-block h-6 w-6" />
        {t.wishlist}
      </h1>

      {wishlist.length === 0 ? (
        <div className="py-16 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <p className="mb-6 text-muted-foreground">{t.no_data}</p>
          <Button asChild>
            <Link href={ROUTES.HOME}>{t.home}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {wishlist.map((product) => {
              const price = Number(product.price);
              const specialPrice =
                product.special_price != null
                  ? Number(product.special_price)
                  : null;
              const hasDiscount =
                specialPrice != null && specialPrice < price;
              const displayPrice = hasDiscount ? specialPrice : price;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-lg border bg-card"
                >
                  {/* Image */}
                  <Link
                    href={`/urun/${product.slug}`}
                    className="relative aspect-square overflow-hidden bg-muted"
                  >
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    {hasDiscount && product.discount_percentage > 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                        -%{Math.round(product.discount_percentage)}
                      </span>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-1.5 p-3">
                    <Link
                      href={`/urun/${product.slug}`}
                      className="line-clamp-2 text-sm font-medium leading-tight hover:underline"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-auto flex items-baseline gap-2">
                      <span className="text-base font-bold">
                        {t.currency}
                        {displayPrice?.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          {t.currency}
                          {price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                        {t.add_to_cart}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeMutation.mutate(product.id)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t.previous}
              </Button>
              <span className="px-3 text-sm text-muted-foreground">
                {t.page} {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                {t.next}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
