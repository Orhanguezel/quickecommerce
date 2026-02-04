import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";

import { Export } from "./export.type";


export const useExportStoreService = () => {
  return useBaseService<Export>(API_ENDPOINTS.EXPORT);
};
