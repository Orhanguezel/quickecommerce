"use client";

import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { useSiteInfoService, useMenuService, useCategoryService } from "./site.service";

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

export const useMenuQuery = () => {
  const { findAll } = useMenuService();

  const { data, isPending, error } = useQuery({
    queryKey: [API_ENDPOINTS.MENU],
    queryFn: () => findAll({ pagination: "false" }),
    staleTime: 1000 * 60 * 30,
  });

  return {
    menus: (data?.data as any)?.data ?? [],
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
