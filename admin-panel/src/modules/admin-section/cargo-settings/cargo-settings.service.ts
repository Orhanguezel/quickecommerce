import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";

export const useCargoSettingsService = () => {
  return useBaseService(API_ENDPOINTS.CARGO_SETTINGS);
};
