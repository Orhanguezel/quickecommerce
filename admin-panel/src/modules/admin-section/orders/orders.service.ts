import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Orders } from "./orders.type";
import { statusUpdateData } from "./orders.schema";

// Hook for Orders Service
export const useOrdersQueryService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.ADMIN_ORDER_LIST);
};
export const useInvoiceService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.ADMIN_ORDER_INVOICE);
};
export const useOrdersDropdownQueryService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.FLASH_DEALS_DROPDOWN_LIST);
};
export const useOrdersAllProductsQueryService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.FLASH_DEALS_ALL_PRODUCTS_LIST);
};
export const useDeliverymanListQueryService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.ADMIN_DELIVERY_DROPDOWN_LIST);
};

export const useOrdersStoreService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.FLASH_DEALS_ADD);
};

export const useOrdersUpdateService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.FLASH_DEALS_UPDATE);
};
export const useOrdersStatusUpdateService = () =>
  useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_ORDER_STATUS_UPDATE);

export const usePaymentStatusUpdateService = () =>
  useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_PAYMENT_STATUS_UPDATE);
export const useDeliverymanAssignService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_DELIVERY_ASSIGN);
};
export const useCancelOrderService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_ORDER_CANCEL);
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
