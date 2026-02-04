import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { GoogleMapSettingsControls } from "./google-map-settings.type";

// Hook for Brand Service
export const useGoogleMapForAllService = () => {
  return useBaseService<GoogleMapSettingsControls>(API_ENDPOINTS.GOOGLE_MAP_FOR_ALL);
};
export const useGoogleMapSettingsService = () => {
  return useBaseService<GoogleMapSettingsControls>(API_ENDPOINTS.GOOGLE_MAP_SETTINGS);
};

// Hook for google map service 
export const useGoogleMapSettingsMutionsService = () => {
  return useBaseService<GoogleMapSettingsControls>(API_ENDPOINTS.GOOGLE_MAP_SETTINGS);
};
