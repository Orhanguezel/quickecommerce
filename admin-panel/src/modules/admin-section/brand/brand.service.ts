import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Brand } from "./brand.type";
import { statusUpdateData } from "./brand.schema";

// Hook for Brand Service
export const useBrandQueryService = () => {
  return useBaseService<Brand>(API_ENDPOINTS.ADMIN_BRAND_LIST);
};
export const useBrandStoreService = () => {
  return useBaseService<Brand>(API_ENDPOINTS.ADMIN_BRAND_ADD);
};
export const useBrandEditService = () => {
  return useBaseService<Brand>(API_ENDPOINTS.ADMIN_BRAND_EDIT);
};
export const useBrandUpdateService = () => {
  return useBaseService<Brand>(API_ENDPOINTS.ADMIN_BRAND_UPDATE);
};
// Hook for Brand Status Update Service
export const useBrandStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_BRAND_STATUS);
};
export const useBrandDeleteService = () => {
  return useBaseService<any, any>(
    API_ENDPOINTS.ADMIN_BRAND_REMOVE
  );
};
