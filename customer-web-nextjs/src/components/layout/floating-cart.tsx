"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useTranslations } from "next-intl";
import { usePrice } from "@/hooks/use-price";

export function FloatingCart() {
  const items = useCartStore((s) => s.items);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const t = useTranslations("cart");
  const { formatPrice } = usePrice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;
  const priceTotal = mounted ? items.reduce((sum, i) => sum + i.price * i.quantity, 0) : 0;

  return (
    <button
      onClick={openDrawer}
      className="fixed right-0 top-1/2 z-50 -translate-y-1/2 rounded-l-xl bg-primary p-3 shadow-lg transition-opacity hover:opacity-90"
    >
      <div className="flex flex-col items-center gap-1.5">
        <ShoppingBag className="h-5 w-5 text-primary-foreground" />
        <span className="text-xs font-medium text-primary-foreground">
          {itemCount} {t("items")}
        </span>
        <span className="rounded-md border border-primary-foreground/30 px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          {mounted ? formatPrice(priceTotal) : "--"}
        </span>
      </div>
    </button>
  );
}
