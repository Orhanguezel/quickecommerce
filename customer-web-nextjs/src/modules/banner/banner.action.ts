"use client";

import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useBannerService } from "./banner.service";
import type { Banner } from "./banner.type";

export const useBannerQuery = () => {
  const { findAll } = useBannerService();
  const locale = useLocale();

  const { data, isPending, error } = useQuery({
    queryKey: [API_ENDPOINTS.BANNER_LIST, locale],
    queryFn: () => findAll({ theme_name: "theme_one", language: locale }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // API returns grouped by type: { banner_one: [...], banner_two: [...] }
  // Flatten into a single array sorted by id (preserves insertion order)
  const grouped = (data?.data as any) ?? {};
  const banners: Banner[] = (Object.values(grouped).flat() as Banner[]).sort(
    (a, b) => a.id - b.id
  );

  return { banners, isPending, error };
};
