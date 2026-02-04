import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { PageSettings } from "./page-settings.type";

// Hook for Brand Service
export const usePageSettingsRegisterService = () => {
  return useBaseService<PageSettings>(API_ENDPOINTS.REGISTER_SETTINGS);
};
export const usePageSettingsLoginService = () => {
  return useBaseService<PageSettings>(API_ENDPOINTS.LOGIN_SETTINGS);
};
export const useAdminSignInService = () => {
  return useBaseService<PageSettings>(API_ENDPOINTS.ADMIN_SIGN_IN_SETTINGS);
};
export const usePageSettingsAboutService = () => {
  return useBaseService<PageSettings>(API_ENDPOINTS.ABOUT_SETTINGS);
};
export const usePageSettingsContactService = () => {
  return useBaseService<PageSettings>(API_ENDPOINTS.CONTACT_SETTINGS);
};
export const usePageSettingsProductDetailsService = () => {
  return useBaseService<PageSettings>(API_ENDPOINTS.PRODUCT_DETAILS_SETTINGS);
};
export const usePageSettingsBlogDetailsService = () => {
  return useBaseService<PageSettings>(API_ENDPOINTS.BLOG_DETAILS_SETTINGS);
};
export const usePageSettingsHomeService = () => {
  return useBaseService<PageSettings>(API_ENDPOINTS.HOME_SETTINGS);
};
