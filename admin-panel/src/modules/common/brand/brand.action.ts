
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useBrandService } from "./brand.service";
import { BrandQueryOptions } from "./brand.type";


export const useBrandsQuery = (options: Partial<BrandQueryOptions>) => {
  const { findAll } = useBrandService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BRAND_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    brands: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};



