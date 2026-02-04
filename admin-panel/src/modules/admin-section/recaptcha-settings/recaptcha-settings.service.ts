import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { RecaptchaSettings } from "./recaptcha-settings.type";

// Hook for Brand Service
export const useRecaptchaSettingsService = () => {
  return useBaseService<RecaptchaSettings>(API_ENDPOINTS.RECAPTCHA_SETTINGS);
};
