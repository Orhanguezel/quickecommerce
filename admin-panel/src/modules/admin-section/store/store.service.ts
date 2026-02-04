import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Store } from "./store.type";
import { storeStatus } from "./store.schema";


export const useAdminStoreQueryService = () => {
  return useBaseService<Store>(API_ENDPOINTS.ADMIN_STORE_LIST);
};
export const useSubscriptionPackagesQueryService = () => {
  return useBaseService<Store>(API_ENDPOINTS.SUBSCRIPTION_PACKAGE_LIST);
};
export const useAdminStoreService = () => {
  return useBaseService<Store>(API_ENDPOINTS.ADMIN_STORE_ADD);
};
export const useAdminStoreEditService = () => {
  return useBaseService<Store>(API_ENDPOINTS.ADMIN_STORE_EDIT);
};
export const useAdminStoreUpdateService = () => {
  return useBaseService<Store>(API_ENDPOINTS.ADMIN_STORE_UPDATE);
};

export const useStoreStatusUpdateService = () => {
  return useBaseService<Store>(API_ENDPOINTS.ADMIN_STORE_STATUS_UPDATE);
};
export const useStoreDeleteService = () => {
  return useBaseService<storeStatus, any>(
    API_ENDPOINTS.ADMIN_STORE_DELETE
  );
};

export const useStoreDashboardQueryService = () => {
  return useBaseService<Store>(API_ENDPOINTS.STORE_DASHBOARD);
};




export const useTrashQueryService = () => {
  return useBaseService<Store>(API_ENDPOINTS.TRASH_STORE_LIST);
};
export const useTrashRestoreService = () => {
  return useBaseService<Store, any>(
    API_ENDPOINTS.TRASH_STORE_RESTORE
  );
};
export const useTrashDeleteService = () => {
  return useBaseService<Store, any>(
    API_ENDPOINTS.TRASH_STORE_DELETE
  );
};
