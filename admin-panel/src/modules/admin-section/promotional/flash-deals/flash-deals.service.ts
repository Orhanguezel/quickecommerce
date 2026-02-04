import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { FlashDeals } from "./flash-deals.type";
import { statusUpdateData } from "./flash-deals.schema";

// Hook for FlashDeals Service
export const useFlashDealsQueryService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.FLASH_DEALS_LIST);
};
export const useFlashDealsDropdownQueryService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.FLASH_DEALS_DROPDOWN_LIST);
};
export const useFlashDealsAllProductsQueryService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.FLASH_DEALS_ALL_PRODUCTS_LIST);
};

export const useFlashDealsStoreService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.FLASH_DEALS_ADD);
};
export const useFlashDealsEditService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.FLASH_DEALS_EDIT);
};
export const useFlashDealsUpdateService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.FLASH_DEALS_UPDATE);
};
export const useFlashDealsStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.FLASH_DEALS_STATUS_UPDATE);
};
export const useFlashDealsDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    API_ENDPOINTS.FLASH_DEALS_DELETE
  );
};
export const useDeactivateExpiredFlashDealService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.DEACTIVATE_EXPIRED_FLASH_SALE);
};

// Hook for Join Request Service
export const useJoinRequestQueryService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.JOIN_REQUEST_LIST);
};
export const useJoinRequestApproveService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.JOIN_REQUEST_APPROVE);
};
export const useJoinRequestRejectService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.JOIN_REQUEST_REJECT);
};




export const useTypeWiseStoreService = () => {
  return useBaseService<FlashDeals>(API_ENDPOINTS.TYPE_WISE_STORE_LIST);
};