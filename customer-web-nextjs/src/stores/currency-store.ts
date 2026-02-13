import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/modules/currency/currency.type";

interface CurrencyState {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  isLoading: boolean;
  setCurrencies: (currencies: Currency[]) => void;
  setSelectedCurrency: (currency: Currency) => void;
  getSelectedCurrency: () => Currency | null;
  convertPrice: (price: number) => number;
  formatPrice: (price: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currencies: [],
      selectedCurrency: null,
      isLoading: false,

      setCurrencies: (currencies) => {
        const defaultCurrency = currencies.find((c) => c.is_default) || currencies[0];
        set({
          currencies,
          selectedCurrency: get().selectedCurrency || defaultCurrency,
        });
      },

      setSelectedCurrency: (currency) => {
        set({ selectedCurrency: currency });
      },

      getSelectedCurrency: () => {
        return get().selectedCurrency;
      },

      convertPrice: (price: number) => {
        const { selectedCurrency, currencies } = get();
        if (!selectedCurrency || currencies.length === 0) return price;

        // Get default currency (base currency from backend)
        const defaultCurrency = currencies.find((c) => c.is_default);
        if (!defaultCurrency) return price;

        // If selected currency is the default, return original price
        if (selectedCurrency.code === defaultCurrency.code) return price;

        // Convert: price in default currency → selected currency
        // Formula: price * (selected_rate / default_rate)
        const convertedPrice = price * (selectedCurrency.exchange_rate / defaultCurrency.exchange_rate);
        return Math.round(convertedPrice * 100) / 100; // Round to 2 decimals
      },

      formatPrice: (price: number) => {
        const { selectedCurrency } = get();
        if (!selectedCurrency) return price.toFixed(2);

        const convertedPrice = get().convertPrice(price);
        return `${selectedCurrency.symbol}${convertedPrice.toFixed(2)}`;
      },
    }),
    {
      name: "currency-storage",
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
      }),
    }
  )
);
