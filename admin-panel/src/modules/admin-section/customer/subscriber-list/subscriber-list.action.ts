import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { statusUpdateData } from "./subscriber-list.schema";
import {
  useSubscriberListDeleteService,
  useSubscriberListQueryService,
  useSubscriberListReplyService,
  useSubscriberListStatusUpdateService
} from "./subscriber-list.service";
import { SubscriberListQueryOptions } from "./subscriber-list.type";
import { useRef } from "react";

// Hook for Join Request action
export const useSubscriberListQuery = (
  options: Partial<SubscriberListQueryOptions>
) => {
  const { findAll } = useSubscriberListQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SUBSCRIBER_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    SubscriberListData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSubscriberListStatusUpdate = () => {
  const { patchItem } = useSubscriberListStatusUpdateService();
  return useMutation({
    mutationFn: (values: any) => patchItem(values),
    mutationKey: [API_ENDPOINTS.SUBSCRIBER_LIST_STATUS_CHANGE],
    onSuccess: async (data) => {
      
        toast.success(data?.data?.message);
      },
      onError: async (data) => {
        //@ts-ignore
        toast.error(data?.response?.data?.message);
      },
  });
};

export const useSubscriberListReply = () => {
  const { create } = useSubscriberListReplyService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.CONTACT_MESSAGES_REPLY],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useSubscriberListDeleteMutation = () => {
  const { delete: deleteItem } = useSubscriberListDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.SUBSCRIBER_LIST_DELETE],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};