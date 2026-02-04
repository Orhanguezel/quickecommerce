import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Request } from "./request.type";

// Hook for Request Service
export const useRequestQueryService = () => {
  return useBaseService<Request>(API_ENDPOINTS.WITHDRAW_REQUEST_LIST);
};

export const useRequestDetailsService = () => {
  return useBaseService<Request>(SELLER_API_ENDPOINTS.WITHDRAW_REQUEST_DETAILS);
};
export const useWithdrawMethodDropdownQueryService = () => {
  return useBaseService<Request>(SELLER_API_ENDPOINTS.WITHDRAW_METHOD_DROPDOWN);
};


export const useRequestApproveService = () => {
  return useBaseService<Request>(API_ENDPOINTS.WITHDRAW_REQUEST_APPROVE);
};
export const useRequestRejectService = () => {
  return useBaseService<Request>(API_ENDPOINTS.WITHDRAW_REQUEST_REJECT);
};

