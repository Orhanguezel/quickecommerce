import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { StoreType } from "./store-type.type";
import { storeTypeDelete, storeTypeStatusChange } from "./store-type.schema";

export const useStoreTypeService = () => {
  return useBaseService<StoreType>(API_ENDPOINTS.ADMIN_STORE_TYPE_LIST);
};
export const useStoreTypeAddService = () => {
  return useBaseService<StoreType>(API_ENDPOINTS.STORE_TYPE_ADD);
};
export const useStoreTypeUpdateService = () => {
  return useBaseService<StoreType>(API_ENDPOINTS.STORE_TYPE_UPDATE);
};
export const useStoreTypeEditService = () => {
  return useBaseService<StoreType>(API_ENDPOINTS.STORE_TYPE_EDIT);
};

export const useStoreTypeStatusUpdateService = () => {
  return useBaseService<storeTypeStatusChange, any>(
    API_ENDPOINTS.STORE_TYPE_STATUS_CHANGE
  );
};

export const useStoreTypeDeleteService = () => {
  return useBaseService<storeTypeDelete, any>(
    API_ENDPOINTS.STORE_TYPE_DELETE
  );
};
