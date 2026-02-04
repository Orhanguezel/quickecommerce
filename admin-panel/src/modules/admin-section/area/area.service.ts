import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Area } from "./area.type";
import { areaDelete, areaStatusChange } from "./area.schema";

export const useAreaService = () => {
  return useBaseService<Area>(API_ENDPOINTS.PRODUCT_AREA_LIST);
};
export const useAreaAddService = () => {
  return useBaseService<Area>(API_ENDPOINTS.PRODUCT_AREA_ADD);
};
export const useAreaUpdateService = () => {
  return useBaseService<Area>(API_ENDPOINTS.PRODUCT_AREA_UPDATE);
};
export const useAreaEditService = () => {
  return useBaseService<Area>(API_ENDPOINTS.PRODUCT_AREA_EDIT);
};

export const useAreaStatusUpdateService = () => {
  return useBaseService<areaStatusChange, any>(
    API_ENDPOINTS.PRODUCT_AREA_STATUS_UPDATE
  );
};

export const useAreaDeleteService = () => {
  return useBaseService<areaDelete, any>(
    API_ENDPOINTS.PRODUCT_AREA_REMOVE
  );
};