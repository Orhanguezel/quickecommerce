import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Inventory } from "./inventory.type";

export const useInventoryQueryService = () => {
  return useBaseService<Inventory>(API_ENDPOINTS.INVENTORY_LIST);
};

export const useInventoryDeleteService = () => {
  return useBaseService<Inventory>(API_ENDPOINTS.INVENTORY_DELETE);
};