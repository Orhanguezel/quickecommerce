"use client";
import { useState, useEffect } from "react";
import { usePrice } from "@/hooks/use-price";

import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

interface Props {
  translations: {
    your_cart: string;
    empty_cart: string;
    subtotal: string;
    shipping: string;
    total: string;
    checkout: string;
    continue_shopping: string;
    remove: string;
    apply_coupon: string;
    home: string;
    currency: string;
    quantity: string;
  };
}

export function CartClient({ translations: t }: Props) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const totalItems = useCartStore((s) => s.totalItems);
  const { formatPrice } = usePrice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">{t.your_cart}</h1>
        <p className="mb-6 text-muted-foreground">{t.empty_cart}</p>
        <Button asChild>
          <Link href={ROUTES.HOME}>{t.continue_shopping}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={ROUTES.HOME} className="hover:text-foreground">
          {t.home}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{t.your_cart}</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">
        {t.your_cart} ({totalItems()})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border bg-card p-4"
              >
                {/* Image */}
                <Link
                  href={ROUTES.PRODUCT_DETAIL(item.slug)}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={ROUTES.PRODUCT_DETAIL(item.slug)}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    {item.variant_label && (
                      <p className="text-sm text-muted-foreground">
                        {item.variant_label}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= (item.max_cart_qty || 99)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold">
                          
                          {mounted ? formatPrice(item.price * item.quantity) : (item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground">
                            
                            {mounted ? formatPrice(item.price) : item.price.toFixed(2)} x {item.quantity}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">{t.subtotal}</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.subtotal}</span>
                <span className="font-medium">
                  
                  {mounted ? formatPrice(totalPrice()) : totalPrice().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.shipping}</span>
                <span className="text-sm text-muted-foreground">-</span>
              </div>

              <hr />

              <div className="flex justify-between text-lg font-bold">
                <span>{t.total}</span>
                <span>
                  
                  {mounted ? formatPrice(totalPrice()) : totalPrice().toFixed(2)}
                </span>
              </div>
            </div>

            <Button asChild className="mt-6 w-full" size="lg">
              <Link href={ROUTES.CHECKOUT}>{t.checkout}</Link>
            </Button>

            <Button variant="outline" asChild className="mt-3 w-full">
              <Link href={ROUTES.HOME}>{t.continue_shopping}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
