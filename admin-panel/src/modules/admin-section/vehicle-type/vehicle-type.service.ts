import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { VehicleType } from "./vehicle-type.type";
import { statusUpdateData } from "./vehicle-type.schema";

// Hook for VehicleType Service
export const useVehicleTypeQueryService = () => {
  return useBaseService<VehicleType>(API_ENDPOINTS.VEHICLE_TYPE_LIST);
};
export const useVehicleTypeDropdownQueryService = () => {
  return useBaseService<VehicleType>(API_ENDPOINTS.VEHICLE_TYPE_DROPDOWN_LIST);
};
export const useVehicleTypeStoreService = () => {
  return useBaseService<VehicleType>(API_ENDPOINTS.VEHICLE_TYPE_ADD);
};
export const useVehicleTypeEditService = () => {
  return useBaseService<VehicleType>(API_ENDPOINTS.VEHICLE_TYPE_EDIT);
};
export const useVehicleTypeUpdateService = () => {
  return useBaseService<VehicleType>(API_ENDPOINTS.VEHICLE_TYPE_UPDATE);
};
export const useVehicleTypeStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.VEHICLE_TYPE_STATUS_UPDATE);
};
export const useVehicleTypeDeleteService = () => {
  return useBaseService<statusUpdateData, any>(
    API_ENDPOINTS.VEHICLE_TYPE_REMOVE
  );
};
