
import { useBaseService } from "@/modules/core/base.service";
import { Reviews } from "./reviews.type";
import { statusUpdateData } from "./reviews.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

export const useReviewsQueryService = () => {
  return useBaseService<Reviews>(SELLER_API_ENDPOINTS.REVIEWS_LIST);
};
export const useReviewsApproveService = () => {
  return useBaseService<Reviews>(SELLER_API_ENDPOINTS.REVIEWS_APPROVE);
};
export const useReviewsRejectService = () => {
  return useBaseService<Reviews>(SELLER_API_ENDPOINTS.REVIEWS_REJECT);
};
export const useReviewsDeleteService = () => {
  return useBaseService<Reviews>(SELLER_API_ENDPOINTS.REVIEWS_DELETE);
};