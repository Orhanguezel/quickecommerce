import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { FirebaseSettingsControls } from "./firebase-settings.type";

// Hook for Brand Service
export const useFirebaseSettingsService = () => {
  return useBaseService<FirebaseSettingsControls>(API_ENDPOINTS.FIREBASE_SETTINGS);
};
