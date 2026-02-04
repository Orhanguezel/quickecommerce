import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { StoreWiseProduct } from "./store-wise-product.type";

// Hook for Service
export const useStoreWiseProductService = () => {
  return useBaseService<StoreWiseProduct>(API_ENDPOINTS.STORE_WISE_PRODUCT_LIST);
};