import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { SEOSettings } from "./seo-settings.type";

// Hook for Brand Service
export const useSEOSettingsService = () => {
  return useBaseService<SEOSettings>(API_ENDPOINTS.SEO_SETTINGS);
};
