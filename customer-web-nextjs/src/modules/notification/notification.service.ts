"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type { Notification, NotificationListResponse } from "./notification.type";

export function useNotificationListQuery(params: {
  page?: number;
  status?: "read" | "unread";
}) {
  const { getAxiosInstance } = useBaseService<Notification[]>(
    API_ENDPOINTS.NOTIFICATIONS
  );

  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => {
      const res = await getAxiosInstance().get<NotificationListResponse>(
        API_ENDPOINTS.NOTIFICATIONS,
        {
          params: {
            page: params.page ?? 1,
            per_page: 15,
            ...(params.status && { status: params.status }),
          },
        }
      );
      return {
        notifications: res.data?.data ?? [],
        meta: res.data?.meta ?? {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
          from: 0,
          to: 0,
        },
      };
    },
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.NOTIFICATIONS);

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await getAxiosInstance().patch(
        `${API_ENDPOINTS.NOTIFICATIONS}/read`,
        { id }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
