import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { PaymentGateway } from "./payment-gateway.type";

// Hook for Area Dropdown List Service
export const usePaymentGatewayService = () => {
  return useBaseService<PaymentGateway>(API_ENDPOINTS.PAYMENT_GATEWAY_LIST);
};
