
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useInventoryQueryService } from "./inventory.service";
import { InventoryQueryOptions } from "./inventory.type";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";


export const useInventoryQuery = (options: Partial<InventoryQueryOptions>) => {
  const { findAll } = useInventoryQueryService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.INVENTORY_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    InventoryListData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};