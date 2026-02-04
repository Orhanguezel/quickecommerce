
import { useBaseService } from "@/modules/core/base.service";
import { Questions } from "./questions.type";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { statusUpdateData } from "./questions.schema";

// Hook for Join Request Service
export const useQuestionsQueryService = () => {
  return useBaseService<Questions>(SELLER_API_ENDPOINTS.QUESTIONS_LIST);
};
export const useQuestionsApproveService = () => {
  return useBaseService<Questions>(SELLER_API_ENDPOINTS.QUESTIONS_APPROVE);
};
export const useQuestionsRejectService = () => {
  return useBaseService<Questions>(SELLER_API_ENDPOINTS.QUESTIONS_REJECT);
};
export const useQuestionsDeleteService = () => {
  return useBaseService<Questions>(SELLER_API_ENDPOINTS.QUESTIONS_DELETE);
};
export const useQuestionsStatusUpdateService = () => {
  return useBaseService<Questions>(SELLER_API_ENDPOINTS.QUESTIONS_STATUS_CHANGE);
};

export const useQuestionsReplyService = () => {
  return useBaseService<statusUpdateData>(SELLER_API_ENDPOINTS.QUESTIONS_REPLY);
};