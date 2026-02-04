import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Department } from "./department.type";

// Hook for Area Dropdown List Service
export const useDepartmentService = () => {
  return useBaseService<Department>(API_ENDPOINTS.DEPARTMENT_LIST);
};
