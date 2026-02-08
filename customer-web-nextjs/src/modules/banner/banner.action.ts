"use client";

import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useBannerService } from "./banner.service";

export const useBannerQuery = () => {
  const { findAll } = useBannerService();
  const locale = useLocale();

  const { data, isPending, error } = useQuery({
    queryKey: [API_ENDPOINTS.BANNER_LIST, locale],
    queryFn: () => findAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    banners: (data?.data as any)?.data ?? [],
    isPending,
    error,
  };
};
