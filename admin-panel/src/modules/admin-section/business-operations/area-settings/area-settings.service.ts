import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { AreaSettings } from "./area-settings.type";
import { areaSettingsDelete, areaSettingsStatusChange } from "./area-settings.schema";

export const useAreaSettingsService = () => {
  return useBaseService<AreaSettings>(API_ENDPOINTS.ADMIN_STORE_TYPE_LIST);
};
export const useAreaSettingsAddService = () => {
  return useBaseService<AreaSettings>(API_ENDPOINTS.STORE_TYPE_ADD);
};
export const useAreaSettingsUpdateService = () => {
  return useBaseService<AreaSettings>(API_ENDPOINTS.AREA_SETTINGS_UPDATE);
};
export const useAreaSettingsEditService = () => {
  return useBaseService<AreaSettings>(API_ENDPOINTS.AREA_SETTINGS_EDIT);
};

export const useAreaSettingsStatusUpdateService = () => {
  return useBaseService<areaSettingsStatusChange, any>(
    API_ENDPOINTS.STORE_TYPE_STATUS_CHANGE
  );
};

export const useAreaSettingsDeleteService = () => {
  return useBaseService<areaSettingsDelete, any>(
    API_ENDPOINTS.STORE_TYPE_DELETE
  );
};
