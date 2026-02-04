import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Department } from "./department.type";

export const useDepartmentService = () => {
  return useBaseService<any>(API_ENDPOINTS.GET_DEPARTMENT);
};
export const useDepartmentAllService = () => {
  return useBaseService<Department>(API_ENDPOINTS.DEPARTMENT);
};
export const useDepartmentAddService = () => {
  return useBaseService<Department>(API_ENDPOINTS.DEPARTMENT_ADD);
};
export const useDepartmentUpdateService = () => {
  return useBaseService<Department>(API_ENDPOINTS.DEPARTMENT_UPDATE);
};
export const useDepartmentRemoveService = () => {
  return useBaseService<Department>(API_ENDPOINTS.DEPARTMENT_REMOVE);
};
