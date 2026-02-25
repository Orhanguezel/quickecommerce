import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { ShippingCampaign } from "./shipping-campaign.type";

export const useShippingCampaignQueryService = () => {
  return useBaseService<ShippingCampaign>(API_ENDPOINTS.SHIPPING_CAMPAIGN_LIST);
};

export const useShippingCampaignStoreService = () => {
  return useBaseService<ShippingCampaign>(API_ENDPOINTS.SHIPPING_CAMPAIGN_ADD);
};

export const useShippingCampaignEditService = () => {
  return useBaseService<ShippingCampaign>(API_ENDPOINTS.SHIPPING_CAMPAIGN_EDIT);
};

export const useShippingCampaignUpdateService = () => {
  return useBaseService<ShippingCampaign>(API_ENDPOINTS.SHIPPING_CAMPAIGN_UPDATE);
};

export const useShippingCampaignStatusUpdateService = () => {
  return useBaseService<any>(API_ENDPOINTS.SHIPPING_CAMPAIGN_STATUS_UPDATE);
};

export const useShippingCampaignDeleteService = () => {
  return useBaseService<any, any>(API_ENDPOINTS.SHIPPING_CAMPAIGN_DELETE);
};
