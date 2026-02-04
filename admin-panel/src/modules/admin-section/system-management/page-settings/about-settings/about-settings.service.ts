import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./about-settings.schema";
import { AboutSettings } from "./about-settings.type";

// Hook for AboutSettings Service
export const useAboutSettingsQueryService = () => {
  return useBaseService<AboutSettings>(API_ENDPOINTS.ABOUT_SETTINGS);
};


export const usePageUpdateService = () => {
  return useBaseService<AboutSettings>(API_ENDPOINTS.PAGES_UPDATE);
};

