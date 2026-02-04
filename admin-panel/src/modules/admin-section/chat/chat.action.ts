






import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { ChatSettingsFormData } from "./chat.schema";
import { useChatDetailsService, useChatSettingsService, useLiveChatService, useReplyMessageService } from "./chat.service";
import { ChatSettingsQueryOptions, LiveChatQueryOptions } from "./chat.type";
import { useEffect, useRef } from "react";

export const useChatSettingsQuery = (options: Partial<ChatSettingsQueryOptions>) => {
  const { findAll } = useChatSettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CHAT_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    ChatSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useChatSettingsStoreMutation = () => {
  const router = useRouter();
  const { create } = useChatSettingsService();

  return useMutation({
    mutationFn: (values: ChatSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.CHAT_SETTINGS],
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

export const useLiveChatQuery = (
  options: Partial<LiveChatQueryOptions>
) => {
  const { findAll } = useLiveChatService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.LIVE_CHAT_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
  return {
    LiveChatList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useChatDetailsQuery = (
  options: Partial<LiveChatQueryOptions>
) => {
  const { findAll } = useChatDetailsService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.LIVE_CHAT_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
  return {
    LiveChatList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useChatDetailsQueryById = (options: Partial<LiveChatQueryOptions>) => {
  const { findAll } = useChatDetailsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CHAT_DETAILS, options?.receiver_id, options?.receiver_type,],
    queryFn: () => findAll(options),
    refetchOnWindowFocus: false,
    enabled: !!options.receiver_id && !!options.receiver_type,
  });
  useEffect(() => {
    //@ts-ignore
    const errorToast = error?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => {
          errorToastRef.current = null;
        },
      });
    }
  }, [error]);
  return {
    ChatDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};


export const useReplyMessageMutation = () => {
  const { create } = useReplyMessageService();
  
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.REPLY_MESSAGE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        // toast.success(data?.data?.message);
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