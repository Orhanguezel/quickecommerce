
import { useBaseService } from "@/modules/core/base.service";
import { RefundRequest } from "./refund-request.type";
import { statusUpdateData } from "./refund-request.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

// Hook for RefundRequest Service
export const useRefundRequestQueryService = () => {
  return useBaseService<RefundRequest>(SELLER_API_ENDPOINTS.REFUND_REQUEST_LIST);
};

export const useRefundRequestStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(SELLER_API_ENDPOINTS.REFUND_REQUEST_STATUS_CHANGE);
};



export const useRefundReasonQueryService = () => {
  return useBaseService<RefundRequest>(SELLER_API_ENDPOINTS.REFUND_REASON_LIST);
};