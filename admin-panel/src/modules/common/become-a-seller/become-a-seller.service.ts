import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { BecomeASellerType } from "./become-a-seller.type";

// Hook for Brand Service
export const useBecomeASellerTypeService = () => {
  return useBaseService<BecomeASellerType>(API_ENDPOINTS.BECOME_A_SELLER);
};
