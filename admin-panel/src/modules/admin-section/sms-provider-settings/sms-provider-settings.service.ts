import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";

export const useSmsProviderSettingsService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_SMS_PROVIDER_SETTINGS);
};
export const useSmsProviderStatusUpdateService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_SMS_PROVIDER_STATUS_UPDATE);
};
export const useSmsProviderSettingsUpdateService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_SMS_PROVIDER_SETTINGS_UPDATE);
};
export const useOtpLoginStatusUpdateService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_OTP_LOGIN_STATUS_UPDATE);
};

