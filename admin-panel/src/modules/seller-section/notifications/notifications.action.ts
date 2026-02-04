import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { statusUpdateData } from "./notifications.schema";
import {
  useNotificationsDeleteService,
  useNotificationsQueryService,
  useNotificationsReadService,
} from "./notifications.service";
import { NotificationsQueryOptions } from "./notifications.type";

export const useNotificationsQuery = (
  options: Partial<NotificationsQueryOptions>,
  config?: { skip: boolean }
) => {
  const { findAll } = useNotificationsQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_NOTIFICATIONS_ADD],
    queryFn: () => findAll(options),
    enabled: !config?.skip,
    ...options,
  });

  return {
    NotificationsList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// Hook for updating brand status
export const useNotificationsRead = () => {
  const { create } = useNotificationsReadService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_NOTIFICATIONS_READ],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data;
      if (errorText && typeof errorText === "object") {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};

export const useNotificationsDelete = () => {
  const { delete: deleteItem } = useNotificationsDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_NOTIFICATIONS_REMOVE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data;
      if (errorText && typeof errorText === "object") {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};
