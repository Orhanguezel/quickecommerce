import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { FooterCustomization } from "./footer-customization.type";

// Hook for Brand Service
export const useFooterCustomizationService = () => {
  return useBaseService<FooterCustomization>(API_ENDPOINTS.FOOTER_CUSTOMIZATION);
};
