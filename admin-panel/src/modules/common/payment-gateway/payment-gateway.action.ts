
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useQuery } from "@tanstack/react-query";
import { PaymentGatewayQueryOptions } from "./payment-gateway.type";
import { usePaymentGatewayService } from "./payment-gateway.service";

// Hook for querying area dropdown data
export const usePaymentGatewayQuery = (options: Partial<PaymentGatewayQueryOptions>) => {
  const { findAll } = usePaymentGatewayService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PAYMENT_GATEWAY_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    PaymentGatewayList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
