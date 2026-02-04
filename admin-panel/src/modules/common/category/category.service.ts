import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Category } from "./category.type";
import { statusUpdateData } from "./category.schema";

export const useCategoryService = () => {
  return useBaseService<Category>(API_ENDPOINTS.CATEGORY_LIST);
};
export const useCategoryStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.CATEGORY_STATUS);
};
