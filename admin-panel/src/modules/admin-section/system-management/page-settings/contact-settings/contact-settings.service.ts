import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./contact-settings.schema";
import { ContactSettings } from "./contact-settings.type";

// Hook for ContactSettings Service
export const useContactSettingsQueryService = () => {
  return useBaseService<ContactSettings>(API_ENDPOINTS.CONTACT_SETTINGS);
};

export const usePageUpdateService = () => {
  return useBaseService<ContactSettings>(API_ENDPOINTS.PAGES_UPDATE);
};


