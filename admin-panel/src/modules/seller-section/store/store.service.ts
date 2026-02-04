import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Store } from "./store.type";
import { statusUpdateData } from "./store.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";


export const useSellerQueryService = () => {
  return useBaseService<Store>(SELLER_API_ENDPOINTS.SELLER_STORE_LIST);
};
export const useSubscriptionPackagesQueryService = () => {
  return useBaseService<Store>(API_ENDPOINTS.SUBSCRIPTION_PACKAGE_LIST);
};
export const useSellerStoreService = () => {
  return useBaseService<Store>(SELLER_API_ENDPOINTS.SELLER_STORE_ADD);
};
export const useSellerEditService = () => {
  return useBaseService<Store>(SELLER_API_ENDPOINTS.SELLER_STORE_EDIT);
};
export const useSellerUpdateService = () => {
  return useBaseService<Store>(SELLER_API_ENDPOINTS.SELLER_STORE_UPDATE);
};

export const useStoreDashboardQueryService = () => {
  return useBaseService<Store>(SELLER_API_ENDPOINTS.STORE_DASHBOARD);
};

