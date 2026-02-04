import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { CashCollect } from "./cash-collect.type";
import { statusUpdateData } from "./cash-collect.schema";

// Hook for CashCollect Service
export const useCashCollectQueryService = () => {
  return useBaseService<CashCollect>(API_ENDPOINTS.CASH_COLLECT_LIST);
};
export const useCashCollectAddService = () => {
  return useBaseService<CashCollect>(API_ENDPOINTS.CASH_COLLECT_LIST);
};



/* export const useCashCollectEditService = () => {
  return useBaseService<CashCollect>(API_ENDPOINTS.WITHDRAW_METHOD_EDIT);
};

export const useCashCollectUpdateService = () => {
  return useBaseService<CashCollect>(API_ENDPOINTS.WITHDRAW_METHOD_UPDATE);
};

export const useCashCollectStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.WITHDRAW_METHOD_STATUS_CHANGE);
};

export const useCashCollectDeleteService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.WITHDRAW_METHOD_DELETE);
}; */
