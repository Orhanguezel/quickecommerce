import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Seller } from "./seller.type";
import { statusUpdateData } from "./seller.schema";

export const useSellerService = () => {
  return useBaseService<Seller>(API_ENDPOINTS.SELLER_LIST);
};

export const useAdminSellerListService = () => {
  return useBaseService<Seller>(API_ENDPOINTS.ADMIN_SELLER_LIST);
};

export const useSellerEditService = () => {
  return useBaseService<Seller>(API_ENDPOINTS.ADMIN_SELLER_EDIT);
};

export const useSellerDetailsService = () => {
  return useBaseService<Seller>(API_ENDPOINTS.ADMIN_SELLER_DETAILS);
};

export const useSellerStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_SELLER_STATUS_UPDATE);
};


export const useSellerStoreService = () => {
  return useBaseService<Seller>(API_ENDPOINTS.ADMIN_SELLER_ADD);
};

export const useSellerUpdateService = () => {
  return useBaseService<Seller>(API_ENDPOINTS.ADMIN_SELLER_UPDATE);
};

export const useSellerDeleteService = () => {
  return useBaseService<any, any>(
    API_ENDPOINTS.ADMIN_SELLER_REMOVE
  );
};

export const useChangePasswordService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_SELLER_PASSWORD_CHANGE);
};







export const useTrashQueryService = () => {
  return useBaseService<Seller>(API_ENDPOINTS.TRASH_SELLER_LIST);
};
export const useTrashRestoreService = () => {
  return useBaseService<Seller, any>(
    API_ENDPOINTS.TRASH_SELLER_RESTORE
  );
};
export const useTrashDeleteService = () => {
  return useBaseService<Seller, any>(
    API_ENDPOINTS.TRASH_SELLER_DELETE
  );
};