
import { useBaseService } from "@/modules/core/base.service";
import { Attribute } from "./attributes.type";
import { attributeDelete, attributeStatusChange } from "./attributes.schema";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";

export const useAttributeListService = () => {
  return useBaseService<Attribute>(SELLER_API_ENDPOINTS.ATTRIBUTE_LIST);
};
export const useAttributeAddService = () => {
  return useBaseService<Attribute>(SELLER_API_ENDPOINTS.ATTRIBUTE_ADD);
};
export const useAttributeEditService = () => {
  return useBaseService<Attribute>(SELLER_API_ENDPOINTS.ATTRIBUTE_EDIT);
};
export const useAttributeUpdateService = () => {
  return useBaseService<Attribute>(SELLER_API_ENDPOINTS.ATTRIBUTE_UPDATE);
};

export const useAttributeStatusUpdateService = () => {
  return useBaseService<attributeStatusChange, any>(
    SELLER_API_ENDPOINTS.ATTRIBUTE_STATUS_CHANGE
  );
};

export const useAttributeDeleteService = () => {
  return useBaseService<attributeDelete, any>(
    SELLER_API_ENDPOINTS.ATTRIBUTE_REMOVE
  );
};
