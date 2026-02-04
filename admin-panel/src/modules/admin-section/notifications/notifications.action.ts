
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import { statusUpdateData } from "./notifications.schema";
import { useNotificationsDeleteService, useNotificationsEditService, useNotificationsQueryService, useNotificationsReadService } from "./notifications.service";
import { NotificationsQueryOptions } from "./notifications.type";


export const useNotificationsQuery = (options: Partial<NotificationsQueryOptions>,  config?: { skip: boolean }) => {
  const { findAll } = useNotificationsQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_NOTIFICATIONS_ADD],
    queryFn: () => findAll(options),
    enabled: !config?.skip,
    ...options,
  });

  return {
    NotificationsAdminList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useNotificationsQueryById = (id: string) => {
  const { find } = useNotificationsEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_BRAND_EDIT, id],
    queryFn: () => find(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
  useEffect(() => {
    const errorToast = (error as any)?.response?.data?.message;
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
    NotificationsByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useNotificationsRead = () => {
  const { patchItem } = useNotificationsReadService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_NOTIFICATIONS_READ],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useNotificationsDelete = () => {
  const { create } = useNotificationsDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_NOTIFICATIONS_REMOVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
     onError: async (data) => {
          const errorText = (data as any)?.response?.data;
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
