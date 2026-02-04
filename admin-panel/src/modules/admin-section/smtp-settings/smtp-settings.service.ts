import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { SMTPSettings } from "./smtp-settings.type";

// Hook for Brand Service
export const useSMTPSettingsService = () => {
  return useBaseService<SMTPSettings>(API_ENDPOINTS.SMTP_SETTINGS);
};
export const useTestSMTPSettingsService = () => {
  return useBaseService<SMTPSettings>(API_ENDPOINTS.TEST_EMAIL);
};
