import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { productAttribute } from "./product-attribute.type";

// Hook for Brand Service
export const useProductAttributeService = () => {
  return useBaseService<productAttribute>(SELLER_API_ENDPOINTS.PRODUCT_ATTRIBUTE);
};