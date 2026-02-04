import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { EmailTemplate } from "./email-template.type";
import { statusUpdateData } from "./email-template.schema";

// Hook for EmailTemplate Service
export const useEmailTemplateQueryService = () => {
  return useBaseService<EmailTemplate>(API_ENDPOINTS.EMAIL_TEMPLATE_LIST);
};

export const useEmailTemplateEditService = () => {
  return useBaseService<EmailTemplate>(API_ENDPOINTS.EMAIL_TEMPLATE_EDIT);
};

export const useEmailTemplateAddService = () => {
  return useBaseService<EmailTemplate>(API_ENDPOINTS.EMAIL_TEMPLATE_ADD);
};
export const useEmailTemplateUpdateService = () => {
  return useBaseService<EmailTemplate>(API_ENDPOINTS.EMAIL_TEMPLATE_UPDATE);
};

export const useEmailTemplateStatusUpdateService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.EMAIL_TEMPLATE_STATUS_CHANGE);
};

export const useEmailTemplateDeleteService = () => {
  return useBaseService<statusUpdateData>(API_ENDPOINTS.EMAIL_TEMPLATE_DELETE);
};
