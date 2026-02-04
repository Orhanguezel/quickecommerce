import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./banner.schema";
import { Banner } from "./banner.type";

// Hook for Banner Service
export const useBannerQueryService = () => {
  return useBaseService<Banner>(API_ENDPOINTS.BANNER_LIST);
};

export const useBannerStoreService = () => {
  return useBaseService<Banner>(API_ENDPOINTS.BANNER_ADD);
};
export const useBannerEditService = () => {
  return useBaseService<Banner>(API_ENDPOINTS.BANNER_EDIT);
};
export const useBannerUpdateService = () => {
  return useBaseService<Banner>(API_ENDPOINTS.BANNER_UPDATE);
};
export const useBannerStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.BANNER_STATUS_CHANGE);
};
export const useBannerDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    API_ENDPOINTS.BANNER_DELETE
  );
};
