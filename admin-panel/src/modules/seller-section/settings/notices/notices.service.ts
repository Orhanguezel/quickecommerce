
import { useBaseService } from "@/modules/core/base.service";
import { Notices } from "./notices.type";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { statusUpdateData } from "./notices.schema";

// Hook for Join Request Service
export const useNoticesQueryService = () => {
  return useBaseService<Notices>(SELLER_API_ENDPOINTS.NOTICES_LIST);
};
export const useNoticeDetailsService = () => {
  return useBaseService<Notices>(SELLER_API_ENDPOINTS.NOTICES_DETAILS);
};