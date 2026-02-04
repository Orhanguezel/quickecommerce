import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Area } from "./area.type";
import { areaDelete, areaStatusChange } from "./area.schema";

export const useAreaService = () => {
  return useBaseService<Area>(API_ENDPOINTS.AREA_LIST);
};
export const useAreaAddService = () => {
  return useBaseService<Area>(API_ENDPOINTS.AREA_ADD);
};
export const useAreaUpdateService = () => {
  return useBaseService<Area>(API_ENDPOINTS.AREA_UPDATE);
};
export const useAreaEditService = () => {
  return useBaseService<Area>(API_ENDPOINTS.AREA_EDIT);
};

export const useAreaStatusUpdateService = () => {
  return useBaseService<areaStatusChange, any>(
    API_ENDPOINTS.AREA_STATUS_CHANGE
  );
};

export const useAreaDeleteService = () => {
  return useBaseService<areaDelete, any>(
    API_ENDPOINTS.AREA_DELETE
  );
};