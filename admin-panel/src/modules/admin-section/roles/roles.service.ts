import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./roles.schema";
import { Roles } from "./roles.type";

export const useRoleService = () => {
  return useBaseService<Roles>(API_ENDPOINTS.ROLES);
};
export const useRoleEditService = () => {
  return useBaseService<Roles>(API_ENDPOINTS.ROLES_EDIT);
};
export const useRoleStoreService = () => {
  return useBaseService<Roles>(API_ENDPOINTS.ROLES_ADD);
};
export const useRoleUpdateService = () => {
  return useBaseService<Roles>(API_ENDPOINTS.ROLES_UPDATE);
};


export const useRolesStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ROLES_STATUS_CHANGE);
};

export const useRoleDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    API_ENDPOINTS.ROLES_REMOVE
  );
};
