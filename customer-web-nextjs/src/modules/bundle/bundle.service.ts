"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Bundle } from "./bundle.type";

interface Envelope<T> {
  status: boolean;
  data: T;
}

interface PaginatedBundles {
  data: Bundle[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export function useActiveBundlesQuery(perPage = 12) {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.BUNDLES);
  const locale = useLocale();
  return useQuery({
    queryKey: [API_ENDPOINTS.BUNDLES, locale, perPage],
    queryFn: async () => {
      const res = await getAxiosInstance().get<Envelope<PaginatedBundles>>(
        API_ENDPOINTS.BUNDLES,
        { params: { per_page: perPage } }
      );
      return res.data?.data?.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useBundleDetailQuery(slug: string | null) {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.BUNDLE_DETAIL);
  const locale = useLocale();
  return useQuery({
    queryKey: [API_ENDPOINTS.BUNDLE_DETAIL, slug, locale],
    enabled: !!slug,
    queryFn: async () => {
      const res = await getAxiosInstance().get<Envelope<Bundle>>(
        `${API_ENDPOINTS.BUNDLE_DETAIL}/${slug}`
      );
      return res.data?.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
}
