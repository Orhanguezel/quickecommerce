import { useBaseService } from "@/modules/core/base.service";

import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { Export } from "./export.type";


export const useExportStoreService = () => {
  return useBaseService<Export>(SELLER_API_ENDPOINTS.EXPORT);
};
