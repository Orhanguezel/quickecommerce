import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { RefundRequest } from "./refund-request.type";
import { statusUpdateData, UpdateLiveLocationData } from "./refund-request.schema";

// Hook for RefundRequest Service
export const useRefundRequestQueryService = () => {
  return useBaseService<RefundRequest>(API_ENDPOINTS.REFUND_REQUEST_LIST);
};

export const useRefundRequestStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.REFUND_REQUEST_STATUS_CHANGE);
};

export const useUpdateLiveLocationService = () => {
  return useBaseService<UpdateLiveLocationData>(API_ENDPOINTS.UPDATE_LIVE_LOCATION);
};

