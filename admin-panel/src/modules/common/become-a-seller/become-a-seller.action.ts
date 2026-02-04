





import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useBecomeASellerTypeService } from "./become-a-seller.service";


export const useBecomeASellerTypeQuery = (options: Partial<any>) => {
  const { findAll } = useBecomeASellerTypeService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BECOME_A_SELLER],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    BecomeASeller: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};