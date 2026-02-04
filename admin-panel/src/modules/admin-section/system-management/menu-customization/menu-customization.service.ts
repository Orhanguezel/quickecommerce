import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { statusUpdateData } from "./menu-customization.schema";
import { MenuCustomization } from "./menu-customization.type";

// Hook for MenuCustomization Service
export const useMenuCustomizationQueryService = () => {
  return useBaseService<MenuCustomization>(API_ENDPOINTS.MENU_CUSTOMIZATION_LIST);
};

export const useMenuCustomizationStoreService = () => {
  return useBaseService<MenuCustomization>(API_ENDPOINTS.MENU_CUSTOMIZATION_ADD);
};
export const useMenuCustomizationEditService = () => {
  return useBaseService<MenuCustomization>(API_ENDPOINTS.MENU_CUSTOMIZATION_EDIT);
};
export const useMenuCustomizationUpdateService = () => {
  return useBaseService<MenuCustomization>(API_ENDPOINTS.MENU_CUSTOMIZATION_UPDATE);
};
export const useMenuCustomizationStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.BANNER_STATUS_CHANGE);
};
export const useMenuCustomizationDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    API_ENDPOINTS.MENU_CUSTOMIZATION_DELETE
  );
};

export const useMenuPositionUpdateService = () => {
  return useBaseService<MenuCustomization>(
    API_ENDPOINTS.MENU_CUSTOMIZATION_POSITION_CHANGE
  );
};
