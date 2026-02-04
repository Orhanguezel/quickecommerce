import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Import } from "./import.type";

export const useImportStoreService = () => {
  return useBaseService<Import>(API_ENDPOINTS.IMPORT);
};
