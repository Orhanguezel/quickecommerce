"use client";

import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useBannerService } from "./banner.service";
import type { Banner } from "./banner.type";
import { useSiteInfoQuery } from "@/modules/site/site.action";

export const useBannerQuery = () => {
  const { findAll } = useBannerService();
  const locale = useLocale();
  const { siteInfo } = useSiteInfoQuery();
  const activeTheme = siteInfo?.active_theme || "theme_one";

  const { data, isPending, error } = useQuery({
    queryKey: [API_ENDPOINTS.BANNER_LIST, locale, activeTheme],
    queryFn: () => findAll({ theme_name: activeTheme, language: locale }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Boolean(activeTheme),
  });

  // API returns grouped by type: { banner_one: [...], banner_two: [...] }
  // Flatten + normalize layout + sort by row/order/id
  const grouped = (data?.data as any) ?? {};
  const banners: Banner[] = (Object.values(grouped).flat() as Banner[])
    .map((banner) => {
      const typeFallback =
        banner.type === "banner_one"
          ? { desktop_row: 1, desktop_columns: 1 }
          : banner.type === "banner_two"
            ? { desktop_row: 2, desktop_columns: 3 }
            : banner.type === "banner_three"
              ? { desktop_row: 3, desktop_columns: 2 }
              : { desktop_row: 99, desktop_columns: 3 };

      return {
        ...banner,
        desktop_row: banner.desktop_row ?? typeFallback.desktop_row,
        desktop_columns: banner.desktop_columns ?? typeFallback.desktop_columns,
      };
    })
    .sort((a, b) => {
      const ar = a.desktop_row ?? 1;
      const br = b.desktop_row ?? 1;
      if (ar !== br) return ar - br;
      const ao = a.order ?? 0;
      const bo = b.order ?? 0;
      if (ao !== bo) return ao - bo;
      return a.id - b.id;
    });

  return { banners, isPending, error };
};
