"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  ChatListResponse,
  ChatMessagesResponse,
  ChatContact,
  ChatMessage,
} from "./chat.type";

// --- Chat List ---

export function useChatListQuery(params: {
  page?: number;
  type?: "store" | "deliveryman";
  search?: string;
}) {
  const { getAxiosInstance } = useBaseService<ChatContact[]>(
    API_ENDPOINTS.CHAT_LIST
  );

  return useQuery({
    queryKey: ["chat-list", params],
    queryFn: async () => {
      const res = await getAxiosInstance().get<ChatListResponse>(
        API_ENDPOINTS.CHAT_LIST,
        {
          params: {
            page: params.page ?? 1,
            per_page: 20,
            ...(params.type && { type: params.type }),
            ...(params.search && { search: params.search }),
          },
        }
      );
      return {
        contacts: res.data?.data ?? [],
        meta: res.data?.meta ?? {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 0,
        },
      };
    },
  });
}

// --- Chat Messages ---

export function useChatMessagesQuery(
  chatId: number | null,
  page: number = 1
) {
  const { getAxiosInstance } = useBaseService<ChatMessage[]>(
    API_ENDPOINTS.CHAT_MESSAGES
  );

  return useQuery({
    queryKey: ["chat-messages", chatId, page],
    enabled: !!chatId,
    queryFn: async () => {
      const res = await getAxiosInstance().get<ChatMessagesResponse>(
        API_ENDPOINTS.CHAT_MESSAGES,
        {
          params: {
            chat_id: chatId,
            page,
            per_page: 30,
          },
        }
      );
      return {
        messages: res.data?.data ?? [],
        meta: res.data?.meta ?? {
          current_page: 1,
          last_page: 1,
          per_page: 30,
          total: 0,
        },
      };
    },
  });
}

// --- Send Message ---

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.CHAT_SEND);

  return useMutation({
    mutationFn: async (data: {
      receiver_id: number;
      receiver_type: string;
      message?: string;
      file?: File;
    }) => {
      const formData = new FormData();
      formData.append("receiver_id", String(data.receiver_id));
      formData.append("receiver_type", data.receiver_type);
      if (data.message) formData.append("message", data.message);
      if (data.file) formData.append("file", data.file);

      const res = await getAxiosInstance().post(
        API_ENDPOINTS.CHAT_SEND,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["chat-list"] });
    },
  });
}

// --- Mark as Seen ---

export function useMarkChatSeenMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.CHAT_SEEN);

  return useMutation({
    mutationFn: async (chatId: number) => {
      const res = await getAxiosInstance().post(API_ENDPOINTS.CHAT_SEEN, {
        chat_id: chatId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-list"] });
    },
  });
}
