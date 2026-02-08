import { useQuery } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { useLocale } from "next-intl";
import type { Store } from "./store.type";

interface StoreListParams {
  store_type?: string;
  is_featured?: number;
  top_rated?: number;
  limit?: number;
  per_page?: number;
}

interface StoreListResponse {
  data: Store[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export function useStoreListQuery(params?: StoreListParams) {
  const locale = useLocale();
  const { findAll } = useBaseService<StoreListResponse>("/store-list");

  return useQuery({
    queryKey: ["stores", locale, params],
    queryFn: async () => {
      const { data } = await findAll(params);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTopStoresQuery(limit: number = 4) {
  return useStoreListQuery({
    is_featured: 1,
    top_rated: 1,
    limit,
  });
}
