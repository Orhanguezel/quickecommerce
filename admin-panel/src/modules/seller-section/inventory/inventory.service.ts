import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Inventory } from "./inventory.type";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

export const useInventoryQueryService = () => {
  return useBaseService<Inventory>(SELLER_API_ENDPOINTS.INVENTORY_LIST);
};