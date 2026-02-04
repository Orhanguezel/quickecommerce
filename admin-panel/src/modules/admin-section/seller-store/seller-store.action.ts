
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useSellerStoreService } from "./seller-store.service";
import { SellerStoreQueryOptions } from "./seller-store.type";

export const useSellerStoreQuery = (options: Partial<SellerStoreQueryOptions>) => {
  const { findAll } = useSellerStoreService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SELLER_STORE__LIST, options?.seller_id],
    queryFn: () => findAll(options),
  
  });

  return {
    sellerStoreList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
