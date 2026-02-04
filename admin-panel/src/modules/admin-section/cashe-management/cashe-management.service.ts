import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { CasheManagement } from "./cashe-management.type";

export const useCasheManagementService = () => {
  return useBaseService<CasheManagement>(API_ENDPOINTS.CASHE_MANAGEMENT);
};
