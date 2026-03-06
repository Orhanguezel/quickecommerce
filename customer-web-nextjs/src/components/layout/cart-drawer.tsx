"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/config/routes";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { usePrice } from "@/hooks/use-price";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import Image from "next/image";
import { ShoppingCart, X, Minus, Plus, Trash2, LogIn, Truck } from "lucide-react";

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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
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

  // Fetch active shipping campaigns for free shipping threshold
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.SHIPPING_CAMPAIGNS_ACTIVE);
  const { data: shippingCampaigns } = useQuery({
    queryKey: ["shipping-campaigns-active"],
    queryFn: async () => {
      const res = await getAxiosInstance().get(API_ENDPOINTS.SHIPPING_CAMPAIGNS_ACTIVE);
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const itemCount = mounted ? totalItems() : 0;
  const price = mounted ? totalPrice() : 0;
  const displayItems = mounted ? items : [];

  const freeShippingThreshold = useMemo(() => {
    return Number(shippingCampaigns?.free_shipping_min_order_value ?? 0);
  }, [shippingCampaigns]);

  const remainingForFreeShipping = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - price) : 0;
  const freeShippingProgress = freeShippingThreshold > 0 ? Math.min(100, (price / freeShippingThreshold) * 100) : 0;

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
          {/* Free Shipping Progress */}
          {mounted && displayItems.length > 0 && freeShippingThreshold > 0 && (
            <div className="mb-3">
              {remainingForFreeShipping > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/50">
                  <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                    <Truck className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1">
                      {t("free_shipping_progress", { remaining: formatPrice(remainingForFreeShipping) })}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span>{t("free_shipping_earned")}</span>
                </div>
              )}
            </div>
          )}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base font-semibold text-primary">
              {t("subtotal")} :
            </span>
            <span className="text-lg font-bold text-foreground">
              {mounted ? formatPrice(price) : "--"}
            </span>
          </div>
          {mounted && !isAuthenticated && displayItems.length > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <LogIn className="h-4 w-4 shrink-0" />
              <span>
                {t("login_to_checkout")}{" "}
                <Link
                  href="/giris"
                  onClick={closeDrawer}
                  className="font-semibold text-primary underline"
                >
                  {t("login")}
                </Link>
              </span>
            </div>
          )}
          {mounted && isAuthenticated ? (
            <Link
              href={ROUTES.CHECKOUT}
              onClick={closeDrawer}
              title={t("proceed_checkout")}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("proceed_checkout")}
            </Link>
          ) : (
            <Link
              href="/giris"
              onClick={closeDrawer}
              title={t("login")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <LogIn className="h-5 w-5" />
              {t("login_and_checkout")}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
