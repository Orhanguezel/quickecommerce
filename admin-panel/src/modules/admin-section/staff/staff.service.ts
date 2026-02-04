import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Staff } from "./staff.type";
import { statusUpdateData } from "./staff.schema";

export const useRolesQueryService = () => {
  return useBaseService<Staff>(API_ENDPOINTS.ROLES);
};
export const useStaffQueryService = () => {
  return useBaseService<Staff>(API_ENDPOINTS.ADMIN_STAFF_LIST);
};
export const useStaffStoreService = () => {
  return useBaseService<Staff>(API_ENDPOINTS.ADMIN_STAFF_ADD);
};
export const useStaffEditService = () => {
  return useBaseService<Staff>(API_ENDPOINTS.ADMIN_STAFF_EDIT);
};

export const useStaffUpdateService = () => {
  return useBaseService<Staff>(API_ENDPOINTS.ADMIN_STAFF_UPDATE);
};

export const useStaffStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(
    API_ENDPOINTS.ADMIN_STAFF_STATUS
  );
};

export const useStaffDeleteService = () => {
  return useBaseService<Staff, any>(
    API_ENDPOINTS.ADMIN_STAFF_REMOVE
  );
};


export const useChangePasswordService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_STAFF_PASSWORD_CHANGE);
};