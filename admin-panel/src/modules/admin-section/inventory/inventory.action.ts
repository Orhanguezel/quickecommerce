
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useInventoryDeleteService, useInventoryQueryService } from "./inventory.service";
import { InventoryQueryOptions } from "./inventory.type";
import { useSellerStoreService } from "../seller-store/seller-store.service";
import { SellerStoreQueryOptions } from "../seller-store/seller-store.type";
import { toast } from "react-toastify";


// Hook for querying seller store data
export const useInventoryStoreQuery = (options: Partial<SellerStoreQueryOptions>) => {
  const { findAll } = useSellerStoreService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SELLER_STORE__LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    InventoryStoreList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};


export const useInventoryQuery = (options: Partial<InventoryQueryOptions>) => {
  const { findAll } = useInventoryQueryService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.INVENTORY_LIST],
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

export const useInventoryDeleteMutation = () => {
  const { create } = useInventoryDeleteService();

  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.INVENTORY_DELETE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};