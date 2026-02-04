import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { OpenAISettings } from "./openai-settings.type";

// Hook for Brand Service
export const useOpenAISettingsService = () => {
  return useBaseService<OpenAISettings>(API_ENDPOINTS.OPEN_AI_SETTINGS);
};