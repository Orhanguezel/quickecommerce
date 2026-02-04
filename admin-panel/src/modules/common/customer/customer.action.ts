
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { useCustomerService } from "./customer.service";
import { CustomerQueryOptions } from "./customer.type";


export const useCustomerQuery = (options: Partial<CustomerQueryOptions>) => {
  const { findAll } = useCustomerService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CUSTOMER_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    customerList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
