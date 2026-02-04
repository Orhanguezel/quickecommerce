import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { SubscriberList } from "./subscriber-list.type";

// Hook for Join Request Service
export const useSubscriberListQueryService = () => {
  return useBaseService<SubscriberList>(API_ENDPOINTS.SUBSCRIBER_LIST);
};
export const useSubscriberListDeleteService = () => {
  return useBaseService<SubscriberList>(API_ENDPOINTS.SUBSCRIBER_LIST_DELETE);
};
export const useSubscriberListStatusUpdateService = () => {
  return useBaseService<SubscriberList>(API_ENDPOINTS.SUBSCRIBER_LIST_STATUS_CHANGE);
};

export const useSubscriberListReplyService = () => {
  return useBaseService<SubscriberList>(API_ENDPOINTS.CONTACT_MESSAGES_REPLY);
};