import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  AiChatKnowledgeFormData,
  AiChatSettingsFormData,
  ChatSettingsFormData,
} from "./chat.schema";
import {
  useAiChatKnowledgeCreateService,
  useAiChatConversationMessagesService,
  useAiChatKnowledgeDeleteService,
  useAiChatKnowledgeListService,
  useAiChatKnowledgeStatusService,
  useAiChatKnowledgeUpdateService,
  useAiChatConversationsService,
  useAiChatSettingsService,
  useChatDetailsService,
  useChatSettingsService,
  useLiveChatService,
  useReplyMessageService,
} from "./chat.service";
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
  const queryClient = useQueryClient();
  const { create } = useChatSettingsService();

  return useMutation({
    mutationFn: (values: ChatSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.CHAT_SETTINGS],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message || "Chat settings updated.");
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CHAT_SETTINGS] });
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message || "Update failed.");
    },
  });
};

export const useLiveChatQuery = (options: Partial<LiveChatQueryOptions>) => {
  const { findAll } = useLiveChatService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.LIVE_CHAT_LIST, options],
    queryFn: () => findAll(options),
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
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
    queryKey: [
      API_ENDPOINTS.CHAT_DETAILS,
      options?.receiver_id,
      options?.receiver_type,
      options?.page,
      options?.search,
    ],
    queryFn: () => findAll(options),
    refetchOnWindowFocus: false,
    enabled: !!options.receiver_id && !!options.receiver_type,
  });

  useEffect(() => {
    const errorToast = (error as any)?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast.error(`${errorToast}`, {
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
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message || "Message send failed.");
    },
  });
};

export const useAiChatSettingsQuery = () => {
  const { findAll } = useAiChatSettingsService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AI_CHAT_SETTINGS],
    queryFn: () => findAll(),
    refetchOnWindowFocus: false,
  });

  return {
    AiChatSettingsData: (data as any)?.data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAiChatSettingsStoreMutation = () => {
  const queryClient = useQueryClient();
  const { create } = useAiChatSettingsService();
  return useMutation({
    mutationFn: (values: AiChatSettingsFormData & { translations?: Record<string, string> }) =>
      create(values as any),
    mutationKey: [API_ENDPOINTS.AI_CHAT_SETTINGS],
    onSuccess: async (data: any) => {
      toast.success(data?.data?.message || "AI chat settings updated.");
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AI_CHAT_SETTINGS] });
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message || "Update failed.");
    },
  });
};

export const useAiChatKnowledgeListQuery = (params?: {
  search?: string;
  category?: string;
  per_page?: number;
  page?: number;
}) => {
  const { findAll } = useAiChatKnowledgeListService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AI_CHAT_KNOWLEDGE_LIST, params],
    queryFn: () => findAll(params),
    refetchOnWindowFocus: false,
  });

  const payload = (data as any)?.data?.data ?? {};
  return {
    KnowledgeList: payload?.data ?? [],
    pagination: payload,
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAiChatConversationsQuery = (params?: {
  per_page?: number;
  page?: number;
}) => {
  const { findAll } = useAiChatConversationsService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AI_CHAT_CONVERSATIONS, params],
    queryFn: () => findAll(params),
    refetchOnWindowFocus: false,
  });

  const payload = (data as any)?.data?.data ?? {};
  return {
    Conversations: payload?.data ?? [],
    pagination: payload,
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAiChatConversationMessagesQuery = (
  conversationId?: number | null,
  params?: { per_page?: number; page?: number }
) => {
  const { findPageBySlug } = useAiChatConversationMessagesService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AI_CHAT_CONVERSATION_MESSAGES, conversationId, params],
    queryFn: () => findPageBySlug(`${conversationId}/messages`, params),
    refetchOnWindowFocus: false,
    enabled: !!conversationId,
  });

  const payload = (data as any)?.data?.data ?? {};
  return {
    Messages: payload?.data ?? [],
    pagination: payload,
    conversation: (data as any)?.data?.conversation ?? null,
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAiChatKnowledgeCreateMutation = () => {
  const queryClient = useQueryClient();
  const { create } = useAiChatKnowledgeCreateService();
  return useMutation({
    mutationFn: (values: AiChatKnowledgeFormData & { translations?: any }) =>
      create(values as any),
    mutationKey: [API_ENDPOINTS.AI_CHAT_KNOWLEDGE_ADD],
    onSuccess: async (data: any) => {
      toast.success(data?.data?.message || "Knowledge added.");
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AI_CHAT_KNOWLEDGE_LIST] });
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message || "Create failed.");
    },
  });
};

export const useAiChatKnowledgeUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { create } = useAiChatKnowledgeUpdateService();
  return useMutation({
    mutationFn: (values: AiChatKnowledgeFormData & { translations?: any }) =>
      create(values as any),
    mutationKey: [API_ENDPOINTS.AI_CHAT_KNOWLEDGE_UPDATE],
    onSuccess: async (data: any) => {
      toast.success(data?.data?.message || "Knowledge updated.");
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AI_CHAT_KNOWLEDGE_LIST] });
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message || "Update failed.");
    },
  });
};

export const useAiChatKnowledgeStatusMutation = () => {
  const queryClient = useQueryClient();
  const { create } = useAiChatKnowledgeStatusService();
  return useMutation({
    mutationFn: (values: { id: number }) => create(values as any),
    mutationKey: [API_ENDPOINTS.AI_CHAT_KNOWLEDGE_CHANGE_STATUS],
    onSuccess: async (data: any) => {
      toast.success(data?.data?.message || "Status updated.");
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AI_CHAT_KNOWLEDGE_LIST] });
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message || "Status update failed.");
    },
  });
};

export const useAiChatKnowledgeDeleteMutation = () => {
  const queryClient = useQueryClient();
  const { delete: deleteItem } = useAiChatKnowledgeDeleteService();
  return useMutation({
    mutationFn: (id: number | string) => deleteItem(String(id)),
    mutationKey: [API_ENDPOINTS.AI_CHAT_KNOWLEDGE_REMOVE],
    onSuccess: async (data: any) => {
      toast.success(data?.data?.message || "Knowledge deleted.");
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.AI_CHAT_KNOWLEDGE_LIST] });
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message || "Delete failed.");
    },
  });
};
