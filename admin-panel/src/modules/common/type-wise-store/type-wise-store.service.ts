import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { TypeWiseStore } from "./type-wise-store.type";

// Hook for Brand Service
export const useTypeWiseStoreService = () => {
  return useBaseService<TypeWiseStore>(API_ENDPOINTS.TYPE_WISE_STORE_LIST);
};