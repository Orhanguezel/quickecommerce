import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { statusUpdateData } from "./contact-messages.schema";
import {
  useContractMessagesDeleteService,
  useContractMessagesQueryService,
  useContractMessagesReplyService,
  useContractMessagesStatusUpdateService
} from "./contact-messages.service";
import { ContractMessagesQueryOptions } from "./contact-messages.type";

// Hook for Join Request action
export const useContractMessagesQuery = (
  options: Partial<ContractMessagesQueryOptions>
) => {
  const { findAll } = useContractMessagesQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CONTACT_MESSAGES_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    ContractMessagesData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useContractMessagesStatusUpdate = () => {
  const { patchItem } = useContractMessagesStatusUpdateService();
  return useMutation({
    mutationFn: (values: any) => patchItem(values),
    mutationKey: [API_ENDPOINTS.CONTACT_MESSAGES_STATUS_CHANGE],
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

export const useContractMessagesReply = () => {
  const { create } = useContractMessagesReplyService();
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

export const useContractMessagesDeleteMutation = () => {
  const { create } = useContractMessagesDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.CONTACT_MESSAGES_DELETE],
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

