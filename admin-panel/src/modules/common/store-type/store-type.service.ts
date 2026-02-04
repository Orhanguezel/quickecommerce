import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { StoreType } from "./store-type.type";

// Hook for Brand Service
export const useStoreTypeService = () => {
  return useBaseService<StoreType>(API_ENDPOINTS.STORE_TYPE_LIST);
};
