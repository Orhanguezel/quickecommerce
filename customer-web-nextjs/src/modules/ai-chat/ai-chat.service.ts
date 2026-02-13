"use client";

import { useMutation } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { AiChatSendResponse } from "./ai-chat.type";
import { useAuthStore } from "@/stores/auth-store";

export function useAiChatSendMutation() {
  const { isAuthenticated } = useAuthStore();
  const endpoint = isAuthenticated
    ? API_ENDPOINTS.AI_CHAT_SEND
    : API_ENDPOINTS.AI_CHAT_GUEST_SEND;
  const { getAxiosInstance } = useBaseService(endpoint);

  return useMutation({
    mutationFn: async (data: { message: string; session_id: string }) => {
      const res = await getAxiosInstance().post<AiChatSendResponse>(
        endpoint,
        data
      );
      return res.data;
    },
  });
}
