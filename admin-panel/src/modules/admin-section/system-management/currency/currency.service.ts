import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Currency } from "./currency.type";
import { statusUpdateData } from "./currency.schema";

// Hook for Currency Service
export const useCurrencyQueryService = () => {
  return useBaseService<Currency>(API_ENDPOINTS.CURRENCY_LIST);
};
export const useCurrencyStoreService = () => {
  return useBaseService<Currency>(API_ENDPOINTS.CURRENCY_CREATE);
};
export const useCurrencyEditService = () => {
  return useBaseService<Currency>(API_ENDPOINTS.CURRENCY_BY_ID);
};
export const useCurrencyUpdateService = () => {
  return useBaseService<Currency>(API_ENDPOINTS.CURRENCY_UPDATE);
};
// Hook for Currency Status Update Service
export const useCurrencyStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_BRAND_STATUS);
};
export const useCurrencyDeleteService = () => {
  return useBaseService<any, any>(
    API_ENDPOINTS.CURRENCY_DELETE
  );
};
