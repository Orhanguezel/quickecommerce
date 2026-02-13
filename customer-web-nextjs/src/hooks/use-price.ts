"use client";

import { useCurrencyStore } from "@/stores/currency-store";

/**
 * Hook for formatting prices with selected currency
 *
 * @example
 * const { formatPrice, convertPrice } = usePrice();
 * formatPrice(100) // "$100.00" or "₺4372.00" based on selected currency
 */
export function usePrice() {
  const { formatPrice, convertPrice } = useCurrencyStore();

  return {
    formatPrice,
    convertPrice,
  };
}
