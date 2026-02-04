import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Permission } from "./permissions.type";
import { permissionsForStoreOwner } from "./permissions.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

export const usePermissionService = () => {
  return useBaseService<Permission>(API_ENDPOINTS.PERMISSIONS);
};

export const usePermissionForStoreOwnerService = () => {
  return useBaseService<permissionsForStoreOwner>(
    SELLER_API_ENDPOINTS.PERMISSIONS_FOR_STORE_OWNER
  );
};

export const useModuleWisePermissionService = () => {
  return useBaseService<Permission>(API_ENDPOINTS.MODULE_WISE_PERMISSIONS);
};
