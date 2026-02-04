import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./become-seller.schema";
import { BecomeSeller } from "./become-seller.type";

// Hook for BecomeSeller Service
export const useBecomeSellerQueryService = () => {
  return useBaseService<BecomeSeller>(API_ENDPOINTS.BECOME_SELLER_LIST);
};

export const useBecomeSellerStoreService = () => {
  return useBaseService<BecomeSeller>(API_ENDPOINTS.BECOME_SELLER_ADD);
};
export const usePageUpdateService = () => {
  return useBaseService<BecomeSeller>(API_ENDPOINTS.PAGES_UPDATE);
};

