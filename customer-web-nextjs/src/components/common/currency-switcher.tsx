"use client";

import { useState, useEffect } from "react";
import { useCurrencyStore } from "@/stores/currency-store";
import { CurrencyService } from "@/modules/currency/currency.service";
import type { Currency } from "@/modules/currency/currency.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";

export function CurrencySwitcher() {
  const { currencies, selectedCurrency, setCurrencies, setSelectedCurrency } = useCurrencyStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCurrencies = async () => {
      if (currencies.length > 0) return; // Already loaded

      setIsLoading(true);
      try {
        const data = await CurrencyService.getAll();
        setCurrencies(data);
      } catch (error) {
        console.error("Failed to load currencies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrencies();
  }, [currencies.length, setCurrencies]);

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-1">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!selectedCurrency || currencies.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 font-medium">
          <span>{selectedCurrency.code}</span>
          <span className="text-muted-foreground">({selectedCurrency.symbol})</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencyChange(currency)}
            className={
              selectedCurrency.code === currency.code
                ? "bg-accent font-medium"
                : ""
            }
          >
            <span className="flex items-center justify-between w-full">
              <span>{currency.code}</span>
              <span className="text-muted-foreground">{currency.symbol}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
