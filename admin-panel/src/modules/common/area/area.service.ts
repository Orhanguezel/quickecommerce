import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { AreaDropdown } from "./area.type";

// Hook for Area Dropdown List Service
export const useAreaDropdownService = () => {
  return useBaseService<AreaDropdown>(API_ENDPOINTS.AREA_DROPDOWN_LIST);
};
