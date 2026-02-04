import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Import } from "./import.type";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

export const useImportStoreService = () => {
  return useBaseService<Import>(SELLER_API_ENDPOINTS.IMPORT);
};
