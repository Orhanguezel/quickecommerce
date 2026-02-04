import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./profile-settings.schema";
import { ProfileSettings } from "./profile-settings.type";

// Hook for Brand Service
export const useProfileSettingsQueryService = () => {
  return useBaseService<ProfileSettings>(API_ENDPOINTS.PROFILE_SETTINGS);
};
export const useProfileSettingsService = () => {
  return useBaseService<ProfileSettings>(API_ENDPOINTS.PROFILE_SETTINGS_EDIT);
};

export const useChangePasswordService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.PROFILE_SETTINGS_PASSWORD_CHANGE);
};
