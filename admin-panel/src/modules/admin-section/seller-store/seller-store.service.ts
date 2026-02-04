import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { SellerStore } from "./seller-store.type";

// Hook for Brand Service
export const useSellerStoreService = () => {
  return useBaseService<SellerStore>(API_ENDPOINTS.SELLER_STORE__LIST);
};