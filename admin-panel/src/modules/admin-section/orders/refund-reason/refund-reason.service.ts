import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { RefundReason } from "./refund-reason.type";
import { statusUpdateData } from "./refund-reason.schema";

// Hook for RefundReason Service
export const useRefundReasonQueryService = () => {
  return useBaseService<RefundReason>(API_ENDPOINTS.REFUND_REASON_LIST);
};

export const useRefundReasonEditService = () => {
  return useBaseService<RefundReason>(API_ENDPOINTS.REFUND_REASON_EDIT);
};

export const useRefundReasonAddService = () => {
  return useBaseService<RefundReason>(API_ENDPOINTS.REFUND_REASON_ADD);
};
export const useRefundReasonUpdateService = () => {
  return useBaseService<RefundReason>(API_ENDPOINTS.REFUND_REASON_UPDATE);
};

export const useRefundReasonStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.REFUND_REASON_STATUS_CHANGE);
};

export const useRefundReasonDeleteService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.REFUND_REASON_DELETE);
};
