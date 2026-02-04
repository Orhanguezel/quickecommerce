import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { MaintenanceSettings } from "./maintenance-settings.type";

// Hook for Brand Service
export const useMaintenanceSettingsService = () => {
  return useBaseService<MaintenanceSettings>(API_ENDPOINTS.MAINTENANCE_SETTINGS);
};
