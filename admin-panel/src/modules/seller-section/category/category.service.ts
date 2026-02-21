import { useBaseService } from "@/modules/core/base.service";
import { SellerCategory } from "./category.type";
import { categoryStatusChange } from "./category.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

export const useCategoryListService = () => {
  return useBaseService<SellerCategory>(SELLER_API_ENDPOINTS.SELLER_CATEGORY_LIST);
};

export const useCategoryAddService = () => {
  return useBaseService<SellerCategory>(SELLER_API_ENDPOINTS.SELLER_CATEGORY_ADD);
};

export const useCategoryEditService = () => {
  return useBaseService<SellerCategory>(SELLER_API_ENDPOINTS.SELLER_CATEGORY_EDIT);
};

export const useCategoryUpdateService = () => {
  return useBaseService<SellerCategory>(SELLER_API_ENDPOINTS.SELLER_CATEGORY_UPDATE);
};

export const useCategoryStatusService = () => {
  return useBaseService<categoryStatusChange, any>(
    SELLER_API_ENDPOINTS.SELLER_CATEGORY_STATUS
  );
};

export const useCategoryRemoveService = () => {
  return useBaseService<SellerCategory, any>(
    SELLER_API_ENDPOINTS.SELLER_CATEGORY_REMOVE
  );
};
