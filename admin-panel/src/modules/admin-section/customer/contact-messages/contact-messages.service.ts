import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { ContractMessages } from "./contact-messages.type";

// Hook for Join Request Service
export const useContractMessagesQueryService = () => {
  return useBaseService<ContractMessages>(API_ENDPOINTS.CONTACT_MESSAGES_LIST);
};
export const useContractMessagesDeleteService = () => {
  return useBaseService<ContractMessages>(API_ENDPOINTS.CONTACT_MESSAGES_DELETE);
};
export const useContractMessagesStatusUpdateService = () => {
  return useBaseService<ContractMessages>(API_ENDPOINTS.CONTACT_MESSAGES_STATUS_CHANGE);
};

export const useContractMessagesReplyService = () => {
  return useBaseService<ContractMessages>(API_ENDPOINTS.CONTACT_MESSAGES_REPLY);
};