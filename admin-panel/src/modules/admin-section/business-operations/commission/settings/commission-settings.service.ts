import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { CommissionSettings } from "./commission-settings.type";

// Hook for Brand Service
export const useCommissionSettingsService = () => {
  return useBaseService<CommissionSettings>(API_ENDPOINTS.BUSINESS_OPERATION_COMMISSION_SETTINGS);
};