import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Reviews } from "./reviews.type";


// Hook for Join Request Service
export const useReviewsQueryService = () => {
  return useBaseService<Reviews>(API_ENDPOINTS.REVIEWS_LIST);
};
export const useReviewsApproveService = () => {
  return useBaseService<Reviews>(API_ENDPOINTS.REVIEWS_APPROVE);
};
export const useReviewsRejectService = () => {
  return useBaseService<Reviews>(API_ENDPOINTS.REVIEWS_REJECT);
};
export const useReviewsDeleteService = () => {
  return useBaseService<Reviews>(API_ENDPOINTS.REVIEWS_DELETE);
};