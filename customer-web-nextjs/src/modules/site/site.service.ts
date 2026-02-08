"use client";

import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { useBaseService } from "@/lib/base-service";
import type { SiteGeneralInfo, MenuItem, Category, FooterSettings } from "./site.type";

export const useSiteInfoService = () => {
  return useBaseService<SiteGeneralInfo>(API_ENDPOINTS.SITE_GENERAL_INFO);
};

export const useFooterService = () => {
  return useBaseService<FooterSettings>(API_ENDPOINTS.FOOTER);
};

export const useMenuService = () => {
  return useBaseService<MenuItem>(API_ENDPOINTS.MENU);
};

export const useCategoryService = () => {
  return useBaseService<Category>(API_ENDPOINTS.CATEGORIES);
};

export const useCurrencyService = () => {
  return useBaseService<any>(API_ENDPOINTS.CURRENCY_LIST);
};
