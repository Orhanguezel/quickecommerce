import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Deliveryman } from "./deliveryman.type";
import { statusUpdateData } from "./deliveryman.schema";

// Hook for Deliveryman Service
export const useDeliverymanQueryService = () => {
  return useBaseService<Deliveryman>(API_ENDPOINTS.DELIVERYMAN_LIST);
};
export const useDeliverymanRequestQueryService = () => {
  return useBaseService<Deliveryman>(API_ENDPOINTS.DELIVERYMAN_REQUEST_LIST);
};
export const useDeliverymanApproveService = () => {
  return useBaseService<Deliveryman>(API_ENDPOINTS.DELIVERYMAN_APPROVE);
};
export const useDeliverymanStoreService = () => {
  return useBaseService<Deliveryman>(API_ENDPOINTS.DELIVERYMAN_ADD);
};
export const useDeliverymanEditService = () => {
  return useBaseService<Deliveryman>(API_ENDPOINTS.DELIVERYMAN_EDIT);
};
export const useDeliverymanDetailsService = () => {
  return useBaseService<Deliveryman>(API_ENDPOINTS.DELIVERYMAN_DETAILS);
};
export const useDeliverymanUpdateService = () => {
  return useBaseService<Deliveryman>(API_ENDPOINTS.DELIVERYMAN_UPDATE);
};
export const useDeliverymanStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.DELIVERYMAN_STATUS_UPDATE);
};
export const useDeliverymanVerifyUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.DELIVERYMAN_STATUS_VERIFY);
};
export const useDeliverymanDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    API_ENDPOINTS.DELIVERYMAN_REMOVE
  );
};

export const useChangePasswordService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.DELIVERYMAN_PASSWORD_CHANGE);
};

export const useTrashQueryService = () => {
  return useBaseService<Deliveryman>(API_ENDPOINTS.TRASH_DELIVERYMAN_LIST);
};
export const useTrashRestoreService = () => {
  return useBaseService<Deliveryman, any>(
    API_ENDPOINTS.TRASH_DELIVERYMAN_RESTORE
  );
};
export const useTrashDeleteService = () => {
  return useBaseService<Deliveryman, any>(API_ENDPOINTS.TRASH_DELIVERYMAN_DELETE);
};

