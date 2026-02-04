import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Theme } from "./theme.type";


export const useThemeAllService = () => {
  return useBaseService<Theme>(API_ENDPOINTS.THEMES_LIST);
};

export const useThemeDetailsService = () => {
  return useBaseService<Theme>(API_ENDPOINTS.THEMES_DETAILS);
};

export const useThemeAddService = () => {
  return useBaseService<Theme>(API_ENDPOINTS.THEMES_ADD);
};

export const useThemeStatusService = () => {
  return useBaseService<any, any>(
    API_ENDPOINTS.THEME_STATUS
  );
};

