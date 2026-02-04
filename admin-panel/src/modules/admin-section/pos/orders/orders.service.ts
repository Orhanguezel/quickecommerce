import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Orders } from "./orders.type";

// Hook for Orders Service
export const useOrdersQueryService = () => {
  return useBaseService<Orders>(API_ENDPOINTS.POS_ORDER_LIST);
};