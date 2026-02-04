import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { GeneralSettings } from "./general-settings.type";

// Hook for Brand Service
export const useGeneralSettingsService = () => {
  return useBaseService<GeneralSettings>(API_ENDPOINTS.GENERAL_SETTINGS);
};