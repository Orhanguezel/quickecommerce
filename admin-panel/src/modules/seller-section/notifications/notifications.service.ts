
import { useBaseService } from "@/modules/core/base.service";
import { Notifications } from "./notifications.type";
import { statusUpdateData } from "./notifications.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

// Hook for Notifications Service
export const useNotificationsQueryService = () => {
  return useBaseService<Notifications>(SELLER_API_ENDPOINTS.SELLER_NOTIFICATIONS_ADD);
};

// Hook for Notifications Status Update Service
export const useNotificationsReadService = () => {
  return useBaseService<statusUpdateData>(SELLER_API_ENDPOINTS.SELLER_NOTIFICATIONS_READ);
};
export const useNotificationsDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    SELLER_API_ENDPOINTS.SELLER_NOTIFICATIONS_REMOVE
  );
};
