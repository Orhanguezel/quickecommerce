import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./slider.schema";
import { Slider } from "./slider.type";

// Hook for Slider Service
export const useSliderQueryService = () => {
  return useBaseService<Slider>(API_ENDPOINTS.SLIDER_LIST);
};

export const useSliderStoreService = () => {
  return useBaseService<Slider>(API_ENDPOINTS.SLIDER_ADD);
};
export const useSliderEditService = () => {
  return useBaseService<Slider>(API_ENDPOINTS.SLIDER_EDIT);
};
export const useSliderUpdateService = () => {
  return useBaseService<Slider>(API_ENDPOINTS.SLIDER_UPDATE);
};
export const useSliderStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.SLIDER_STATUS_CHANGE);
};
export const useSliderDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    API_ENDPOINTS.SLIDER_DELETE
  );
};
