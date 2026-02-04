import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Notifications } from "./notifications.type";
import { statusUpdateData } from "./notifications.schema";

// Hook for Notifications Service
export const useNotificationsQueryService = () => {
  return useBaseService<Notifications>(API_ENDPOINTS.ADMIN_NOTIFICATIONS_ADD);
};
export const useNotificationsStoreService = () => {
  return useBaseService<Notifications>(API_ENDPOINTS.ADMIN_BRAND_ADD);
};
export const useNotificationsEditService = () => {
  return useBaseService<Notifications>(API_ENDPOINTS.ADMIN_BRAND_EDIT);
};
export const useNotificationsUpdateService = () => {
  return useBaseService<Notifications>(API_ENDPOINTS.ADMIN_BRAND_UPDATE);
};
// Hook for Notifications Status Update Service
export const useNotificationsReadService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.ADMIN_NOTIFICATIONS_READ);
};
export const useNotificationsDeleteService = () => {
  return useBaseService<Notifications, any>(
    API_ENDPOINTS.ADMIN_NOTIFICATIONS_REMOVE
  );
};
