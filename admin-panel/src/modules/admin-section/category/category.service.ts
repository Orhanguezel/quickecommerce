import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Category } from "./category.type";
import { statusUpdateData } from "./category.schema";

export const useCategoryService = () => {
  return useBaseService<Category>(API_ENDPOINTS.CATEGORY);
};
export const useCategoryEditService = () => {
  return useBaseService<Category>(API_ENDPOINTS.CATEGORY_EDIT);
};
export const useCategoryStoreService = () => {
  return useBaseService<Category>(API_ENDPOINTS.CATEGORY_ADD);
};
export const useCategoryUpdateService = () => {
  return useBaseService<Category>(API_ENDPOINTS.CATEGORY_UPDATE);
};
export const useCategoryStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.CATEGORY_STATUS);
};
export const useCategoryDeleteService = () => {
  return useBaseService<Category>(API_ENDPOINTS.CATEGORY_REMOVE);
};
