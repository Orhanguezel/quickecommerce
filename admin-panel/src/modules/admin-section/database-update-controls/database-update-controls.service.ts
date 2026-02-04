import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { DatabaseUpdateControls } from "./database-update-controls.type";

// Hook for Brand Service
export const useDatabaseUpdateControlsService = () => {
  return useBaseService<DatabaseUpdateControls>(API_ENDPOINTS.DATABASE_UPDATE_CONTROL);
};
