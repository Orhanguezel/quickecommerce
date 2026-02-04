import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Questions } from "./questions.type";

// Hook for Join Request Service
export const useQuestionsQueryService = () => {
  return useBaseService<Questions>(API_ENDPOINTS.QUESTIONS_LIST);
};
export const useQuestionsApproveService = () => {
  return useBaseService<Questions>(API_ENDPOINTS.QUESTIONS_APPROVE);
};
export const useQuestionsRejectService = () => {
  return useBaseService<Questions>(API_ENDPOINTS.QUESTIONS_REJECT);
};
export const useQuestionsDeleteService = () => {
  return useBaseService<Questions>(API_ENDPOINTS.QUESTIONS_DELETE);
};
export const useQuestionsStatusUpdateService = () => {
  return useBaseService<Questions>(API_ENDPOINTS.QUESTIONS_STATUS_CHANGE);
};