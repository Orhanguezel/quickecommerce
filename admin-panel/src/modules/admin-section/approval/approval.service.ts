import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Approval } from "./approval.type";

export const useStoreRequestQueryService = () => {
  return useBaseService<Approval>(API_ENDPOINTS.STORE_REQUEST_APPROVAL_LIST);
};

export const useStoreRequestApproveService = () => {
  return useBaseService<Approval>(API_ENDPOINTS.STORE_REQUEST_APPROVE);
};