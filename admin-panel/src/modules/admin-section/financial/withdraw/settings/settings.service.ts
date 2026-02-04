import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { WithdrawSettings } from "./settings.type";

// Hook for wallet Service
export const useWithdrawSettingsService = () => {
  return useBaseService<WithdrawSettings>(API_ENDPOINTS.WITHDRAW_SETTINGS);
};
