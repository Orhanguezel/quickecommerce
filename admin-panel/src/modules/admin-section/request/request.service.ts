import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Request } from "./request.type";

export const useRequestQueryService = () => {
  return useBaseService<Request>(API_ENDPOINTS.REQUEST_LIST);
};

export const useRequestApproveService = () => {
  return useBaseService<Request>(API_ENDPOINTS.REQUEST_APPROVE);
};