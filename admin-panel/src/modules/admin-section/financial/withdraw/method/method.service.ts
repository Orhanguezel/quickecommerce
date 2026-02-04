import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Method } from "./method.type";
import { statusUpdateData } from "./method.schema";

// Hook for Method Service
export const useMethodQueryService = () => {
  return useBaseService<Method>(API_ENDPOINTS.WITHDRAW_METHOD_LIST);
};

export const useMethodEditService = () => {
  return useBaseService<Method>(API_ENDPOINTS.WITHDRAW_METHOD_EDIT);
};

export const useMethodAddService = () => {
  return useBaseService<Method>(API_ENDPOINTS.WITHDRAW_METHOD_ADD);
};
export const useMethodUpdateService = () => {
  return useBaseService<Method>(API_ENDPOINTS.WITHDRAW_METHOD_UPDATE);
};

export const useMethodStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.WITHDRAW_METHOD_STATUS_CHANGE);
};

export const useMethodDeleteService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.WITHDRAW_METHOD_DELETE);
};
