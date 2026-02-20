import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { Attribute } from "./attributes.type";
import { attributeDelete, attributeStatusChange } from "./attributes.schema";

export const useAttributeListService = () => {
  return useBaseService<Attribute>(API_ENDPOINTS.ATTRIBUTE_LIST);
};
export const useAttributeAddService = () => {
  return useBaseService<Attribute>(API_ENDPOINTS.ATTRIBUTE_ADD);
};
export const useAttributeEditService = () => {
  return useBaseService<Attribute>(API_ENDPOINTS.ATTRIBUTE_EDIT);
};
export const useAttributeUpdateService = () => {
  return useBaseService<Attribute>(API_ENDPOINTS.ATTRIBUTE_UPDATE);
};

export const useAttributeStatusUpdateService = () => {
  return useBaseService<attributeStatusChange, any>(
    API_ENDPOINTS.ATTRIBUTE_STATUS_CHANGE
  );
};

export const useAttributeDeleteService = () => {
  return useBaseService<attributeDelete, any>(
    API_ENDPOINTS.ATTRIBUTE_REMOVE
  );
};

export const useAttributeTypeWiseService = () => {
  return useBaseService<Attribute>(API_ENDPOINTS.ATTRIBUTE_TYPE_WISE);
};

