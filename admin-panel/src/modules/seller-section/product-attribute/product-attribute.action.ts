
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useProductAttributeService } from "./product-attribute.service";
import { ProductAttributeQueryOptions } from "./product-attribute.type";

export const useProductAttributeQuery = (options: Partial<ProductAttributeQueryOptions>) => {
  const { findAll } = useProductAttributeService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.PRODUCT_ATTRIBUTE, options?.type],
    queryFn: () => findAll(options),
    enabled: !!options?.type,
  });

  return {
    productAttribute: (data?.data as any)?.data ?? data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};