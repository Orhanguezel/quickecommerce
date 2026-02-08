'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { useCurrencyQuery, type CurrencyItem } from '@/modules/site/site.action';

export function CurrencySwitcher() {
  const { currencies, defaultCurrency } = useCurrencyQuery();
  const [selected, setSelected] = useState<CurrencyItem | null>(null);

  const current = selected ?? defaultCurrency;

  if (!current) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs font-medium"
        >
          <span>{current.value} {current.symbol}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.value}
            onClick={() => setSelected(currency)}
            className="flex w-full cursor-pointer items-center"
          >
            <span className="mr-2 font-medium">{currency.symbol}</span>
            <span className="flex-1">{currency.label}</span>
            {current.value === currency.value && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
