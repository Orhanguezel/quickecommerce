import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { DynamicField } from "./dynamic-fields.type";
import { statusUpdateData } from "./dynamic-fields.schema";

// Hook for DynamicField Service
export const useDynamicFieldQueryService = () => {
  return useBaseService<DynamicField>(API_ENDPOINTS.DYNAMIC_FIELD_LIST);
};
export const useDynamicFieldStoreService = () => {
  return useBaseService<DynamicField>(API_ENDPOINTS.DYNAMIC_FIELD_CREATE);
};
export const useDynamicFieldEditService = () => {
  return useBaseService<DynamicField>(API_ENDPOINTS.DYNAMIC_FIELD_BY_ID);
};
export const useDynamicFieldUpdateService = () => {
  return useBaseService<DynamicField>(API_ENDPOINTS.DYNAMIC_FIELD_UPDATE);
};

export const useDynamicFieldStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.DYNAMIC_FIELD_STATUS_UPDATE);
};
export const useDynamicRequiredFieldUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.DYNAMIC_REQUIRED_FIELD_UPDATE);
};
export const useDynamicFieldDeleteService = () => {
  return useBaseService<any, any>(
    API_ENDPOINTS.DYNAMIC_FIELD_DELETE
  );
};

export const useDynamicFieldOptionQueryService = () => {
  return useBaseService<DynamicField>(API_ENDPOINTS.DYNAMIC_FIELD_OPTION_LIST);
};
export const useDynamicFieldOptionStoreService = () => {
  return useBaseService<DynamicField>(API_ENDPOINTS.DYNAMIC_FIELD_OPTION_CREATE);
};
export const useDynamicFieldOptionEditService = () => {
  return useBaseService<DynamicField>(API_ENDPOINTS.DYNAMIC_FIELD_OPTION_BY_ID);
};
export const useDynamicFieldOptionUpdateService = () => {
  return useBaseService<DynamicField>(API_ENDPOINTS.DYNAMIC_FIELD_OPTION_UPDATE);
};
export const useDynamicFieldOptionDeleteService = () => {
  return useBaseService<any, any>(
    API_ENDPOINTS.DYNAMIC_FIELD_OPTION_DELETE
  );
};