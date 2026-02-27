"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { useCartStore } from "@/stores/cart-store";
import { usePrice } from "@/hooks/use-price";
import Image from "next/image";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";

export function CartDrawer() {
  const t = useTranslations("cart");
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCartStore();
  const { formatPrice } = usePrice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isDrawerOpen, closeDrawer]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const itemCount = mounted ? totalItems() : 0;
  const price = mounted ? totalPrice() : 0;
  const displayItems = mounted ? items : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 z-[9999] flex h-full w-full max-w-[400px] flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">
              {t("my_cart")} ( {itemCount} {t("items")} )
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Cart Items (scrollable) ── */}
        <div className="flex-1 overflow-y-auto">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingCart className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-base text-muted-foreground">
                {t("your_cart_empty")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayItems.map((item) => (
                <div key={item.id} className="flex gap-3 px-5 py-4">
                  {/* Product Image */}
                  <Link
                    href={ROUTES.PRODUCT_DETAIL(item.slug)}
                    onClick={closeDrawer}
                    className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={ROUTES.PRODUCT_DETAIL(item.slug)}
                        onClick={closeDrawer}
                        className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      {item.variant_label && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.variant_label}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="flex h-7 w-8 items-center justify-center border-x border-border text-xs font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= (item.max_cart_qty || 99)
                          }
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price + Delete */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer (Subtotal + Checkout) ── */}
        <div className="border-t border-border bg-card px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base font-semibold text-primary">
              {t("subtotal")} :
            </span>
            <span className="text-lg font-bold text-foreground">
              {mounted ? formatPrice(price) : "--"}
            </span>
          </div>
          <Link
            href={ROUTES.CHECKOUT}
            onClick={closeDrawer}
            title={t("proceed_checkout")}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("proceed_checkout")}
          </Link>
        </div>
      </div>
    </>
  );
}
