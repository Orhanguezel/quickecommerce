import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { packageDelete, packageStatusChange, statusUpdateData } from "./package.schema";
import { Package } from "./package.type";

// Hook for Package Service
export const usePackageQueryService = () => {
  return useBaseService<Package>(API_ENDPOINTS.PACKAGE_LIST);
};
export const usePackageStoreService = () => {
  return useBaseService<Package>(API_ENDPOINTS.PACKAGE_ADD);
};
export const usePackageEditService = () => {
  return useBaseService<Package>(API_ENDPOINTS.PACKAGE_EDIT);
};
export const usePackageUpdateService = () => {
  return useBaseService<Package>(API_ENDPOINTS.PACKAGE_UPDATE);
};

export const usePackageStatusUpdateService = () => {
  return useBaseService<packageStatusChange>(
    API_ENDPOINTS.PACKAGE_STATUS_CHANGE
  );
};

export const usePackageDeleteService = () => {
  return useBaseService<packageDelete, any>(
    API_ENDPOINTS.PACKAGE_DELETE
  );
};




export const useSubscriptionQueryService = () => {
  return useBaseService<Package>(API_ENDPOINTS.SUBSCRIPTION_STORE_LIST);
};

export const useSubscriptionStoreHistoryService = () => {
  return useBaseService<Package>(API_ENDPOINTS.SUBSCRIPTION_STORE_HISTORY);
};


export const useSubscriptionStoreStatusUpdateService = () => {
  return useBaseService<packageStatusChange>(
    API_ENDPOINTS.SUBSCRIPTION_STORE_STATUS_CHANGE
  );
};