import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Staff } from "./staff.type";
import { statusUpdateData } from "./staff.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

export const useSellerRolesQueryService = () => {
  return useBaseService<Staff>(SELLER_API_ENDPOINTS.SELLER_ROLES);
};
export const useStaffQueryService = () => {
  return useBaseService<Staff>(SELLER_API_ENDPOINTS.STAFF_LIST);
};
export const useStaffStoreService = () => {
  return useBaseService<Staff>(SELLER_API_ENDPOINTS.STAFF_ADD);
};
export const useStaffEditService = () => {
  return useBaseService<Staff>(SELLER_API_ENDPOINTS.STAFF_EDIT);
};

export const useStaffUpdateService = () => {
  return useBaseService<Staff>(SELLER_API_ENDPOINTS.STAFF_UPDATE);
};

export const useStaffStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(
    SELLER_API_ENDPOINTS.STAFF_STATUS
  );
};

export const useStaffDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    SELLER_API_ENDPOINTS.STAFF_REMOVE
  );
};
