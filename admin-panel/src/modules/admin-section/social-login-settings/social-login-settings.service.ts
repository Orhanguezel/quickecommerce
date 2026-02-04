import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { SocialSettings } from "./social-login-settings.type";

// Hook for Brand Service
export const useSocialSettingsService = () => {
  return useBaseService<SocialSettings>(API_ENDPOINTS.SOCIAL_SETTINGS);
};
