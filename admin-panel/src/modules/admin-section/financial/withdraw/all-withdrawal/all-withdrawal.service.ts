import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { AllWithdrawal } from "./all-withdrawal.type";
import { statusUpdateData } from "./all-withdrawal.schema";

// Hook for AllWithdrawal Service
export const useAllWithdrawalQueryService = () => {
  return useBaseService<AllWithdrawal>(API_ENDPOINTS.WITHDRAW_LIST);
};

export const useAllWithdrawalEditService = () => {
  return useBaseService<AllWithdrawal>(API_ENDPOINTS.WITHDRAW_DETAILS);
};








export const useAllWithdrawalAddService = () => {
  return useBaseService<AllWithdrawal>(API_ENDPOINTS.WITHDRAW_METHOD_ADD);
};
export const useAllWithdrawalUpdateService = () => {
  return useBaseService<AllWithdrawal>(API_ENDPOINTS.WITHDRAW_METHOD_UPDATE);
};

export const useAllWithdrawalStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.WITHDRAW_METHOD_STATUS_CHANGE);
};

export const useAllWithdrawalDeleteService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.WITHDRAW_METHOD_DELETE);
};
