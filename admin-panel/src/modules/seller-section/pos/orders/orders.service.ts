import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Orders } from "./orders.type";
import { statusUpdateData } from "./orders.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

// Hook for Orders Service
export const useOrdersQueryService = () => {
  return useBaseService<Orders>(SELLER_API_ENDPOINTS.POS_ORDER_LIST);
};
export const useInvoiceService = () => {
  return useBaseService<Orders>(SELLER_API_ENDPOINTS.SELLER_ORDER_INVOICE);
};

export const useCancelOrderService = () => {
  return useBaseService<statusUpdateData>(SELLER_API_ENDPOINTS.SELLER_ORDER_CANCEL);
};

export const useOrdersStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(SELLER_API_ENDPOINTS.SELLER_ORDER_STATUS_UPDATE);
};
























export const useOrdersDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    API_ENDPOINTS.FLASH_DEALS_DELETE
  );
};
export const useDeactivateExpiredFlashDealService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.DEACTIVATE_EXPIRED_FLASH_SALE);
};

// Hook for Join Request Service
export const useJoinRequestQueryService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.JOIN_REQUEST_LIST);
};
export const useJoinRequestApproveService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.JOIN_REQUEST_APPROVE);
};
export const useJoinRequestRejectService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.JOIN_REQUEST_REJECT);
};