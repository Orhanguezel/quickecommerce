
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useTypeWiseStoreService } from "./type-wise-store.service";
import { TypeWiseStoreQueryOptions } from "./type-wise-store.type";

// Hook for querying seller store data
export const useTypeWiseStoreQuery = (options: Partial<TypeWiseStoreQueryOptions>) => {
  const { findAll } = useTypeWiseStoreService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.TYPE_WISE_STORE_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    TypeWiseStoreList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
