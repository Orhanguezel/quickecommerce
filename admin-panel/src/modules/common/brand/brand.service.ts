import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Brand } from "./brand.type";
import { statusUpdateData } from "./brand.schema";

// Hook for Brand Service
export const useBrandService = () => {
  return useBaseService<Brand>(API_ENDPOINTS.BRAND_LIST);
};

// Hook for Brand Status Update Service
export const useBrandStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_BRAND_STATUS);
};
