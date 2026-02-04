import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";

import { SiteMapSettings } from "./sitemap-settings.type";


export const useSiteMapSettingsService = () => {
  return useBaseService<any>(API_ENDPOINTS.ADMIN_SITEMAP_SETTINGS);
};
