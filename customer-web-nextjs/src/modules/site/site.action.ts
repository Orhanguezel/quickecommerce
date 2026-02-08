"use client";

import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useSiteInfoService, useMenuService, useCategoryService, useFooterService, useCurrencyService } from "./site.service";

export const useSiteInfoQuery = () => {
  const { findAll } = useSiteInfoService();

  const { data, isPending, error } = useQuery({
    queryKey: [API_ENDPOINTS.SITE_GENERAL_INFO],
    queryFn: () => findAll(),
    staleTime: 1000 * 60 * 30,
  });

  return {
    siteInfo: (data?.data as any)?.site_settings ?? null,
    isPending,
    error,
  };
};

export const useFooterQuery = () => {
  const { findAll } = useFooterService();
  const locale = useLocale();

  const { data, isPending, error } = useQuery({
    queryKey: [API_ENDPOINTS.FOOTER, locale],
    queryFn: () => findAll(),
    staleTime: 1000 * 60 * 30,
  });

  return {
    footerData: (data?.data as any)?.data?.content ?? null,
    isPending,
    error,
  };
};

export const useMenuQuery = () => {
  const { findAll } = useMenuService();
  const locale = useLocale();

  const { data, isPending, error } = useQuery({
    queryKey: [API_ENDPOINTS.MENU, locale],
    queryFn: () => findAll({ pagination: "false", language: locale }),
    staleTime: 1000 * 60 * 30,
  });

  return {
    menus: (data?.data as any)?.menus ?? [],
    isPending,
    error,
  };
};

export const useCategoryQuery = () => {
  const { findAll } = useCategoryService();

  const { data, isPending, error } = useQuery({
    queryKey: [API_ENDPOINTS.CATEGORIES],
    queryFn: () => findAll({ per_page: 100, all: false }),
    staleTime: 1000 * 60 * 30,
  });

  return {
    categories: (data?.data as any)?.data ?? [],
    isPending,
    error,
  };
};

export interface CurrencyItem {
  label: string;
  value: string;
  symbol: string;
  exchange_rate: number;
  is_default: boolean;
}

export const useCurrencyQuery = () => {
  const { findAll } = useCurrencyService();

  const { data, isPending, error } = useQuery({
    queryKey: [API_ENDPOINTS.CURRENCY_LIST],
    queryFn: () => findAll(),
    staleTime: 1000 * 60 * 30,
  });

  const currencies: CurrencyItem[] = (data?.data as any)?.data ?? [];
  const defaultCurrency = currencies.find((c) => c.is_default) ?? currencies[0] ?? null;

  return {
    currencies,
    defaultCurrency,
    isPending,
    error,
  };
};
