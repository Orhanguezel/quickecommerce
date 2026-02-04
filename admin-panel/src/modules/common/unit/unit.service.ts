import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Unit } from "./unit.type";

// Hook for Brand Service
export const useUnitService = () => {
  return useBaseService<Unit>(API_ENDPOINTS.UNIT_LIST);
};
