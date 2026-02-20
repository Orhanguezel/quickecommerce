
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useStoreTypeService } from "./store-type.service";
import { StoreTypeQueryOptions } from "./store-type.type";


export const useStoreTypeQuery = (options: Partial<StoreTypeQueryOptions>) => {
  const { findAll } = useStoreTypeService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.STORE_TYPE_LIST, options?.merchant_id, (options as any)?.language],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    // API may return either { data: [...] } or direct [...]
    storeType: (data as any)?.data ?? data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
