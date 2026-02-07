"use client";

import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import { useBaseService } from "@/lib/base-service";
import type { SiteGeneralInfo, MenuItem, Category } from "./site.type";

export const useSiteInfoService = () => {
  return useBaseService<SiteGeneralInfo>(API_ENDPOINTS.SITE_GENERAL_INFO);
};

export const useMenuService = () => {
  return useBaseService<MenuItem>(API_ENDPOINTS.MENU);
};

export const useCategoryService = () => {
  return useBaseService<Category>(API_ENDPOINTS.CATEGORIES);
};
