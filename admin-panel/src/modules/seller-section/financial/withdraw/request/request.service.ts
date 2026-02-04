import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Request } from "./request.type";
import { statusUpdateData } from "./request.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

// Hook for Request Service
export const useRequestQueryService = () => {
  return useBaseService<Request>(SELLER_API_ENDPOINTS.WITHDRAW_REQUEST_LIST);
};
export const useRequestDetailsService = () => {
  return useBaseService<Request>(SELLER_API_ENDPOINTS.WITHDRAW_REQUEST_DETAILS);
};
export const useWithdrawMethodDropdownQueryService = () => {
  return useBaseService<Request>(SELLER_API_ENDPOINTS.WITHDRAW_METHOD_DROPDOWN);
};

export const useRequestAddService = () => {
  return useBaseService<Request>(SELLER_API_ENDPOINTS.WITHDRAW_REQUEST_ADD);
};

