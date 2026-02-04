import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./gdpr-cookie-settings.schema";
import { GDPRCookieSettings } from "./gdpr-cookie-settings.type";

// Hook for GDPRCookieSettings Service
export const useGDPRCookieSettingsQueryService = () => {
  return useBaseService<GDPRCookieSettings>(API_ENDPOINTS.GDPR_COOKIE_LIST);
};

export const useGDPRCookieSettingsStoreService = () => {
  return useBaseService<GDPRCookieSettings>(API_ENDPOINTS.GDPR_COOKIE_ADD);
};

