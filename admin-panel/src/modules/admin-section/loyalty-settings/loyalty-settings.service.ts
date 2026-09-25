import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { LoyaltySettings } from "./loyalty-settings.type";

export const useLoyaltySettingsService = () => {
  return useBaseService<LoyaltySettings>(API_ENDPOINTS.LOYALTY_SETTINGS);
};
