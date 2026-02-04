import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useStoreWiseProductService } from "./store-wise-product.service";
import { StoreWiseProductQueryOptions } from "./store-wise-product.type";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

// Hook for querying seller store data
export const useStoreWiseProductQuery = (
  options: Partial<StoreWiseProductQueryOptions>
) => {
  const { findAll } = useStoreWiseProductService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.STORE_WISE_PRODUCT_LIST, options?.store_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    //@ts-ignore
    const errorToast = error?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => {
          errorToastRef.current = null;
        },
      });
    }
  }, [error]);
  return {
    StoreWiseProductList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
