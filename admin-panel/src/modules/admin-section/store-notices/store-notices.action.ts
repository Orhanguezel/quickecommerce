import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { NoticeFormData, statusUpdateData } from "./store-notices.schema";
import {
  useNoticeDeleteService,
  useNoticeEditService,
  useNoticeQueryService,
  useNoticeStatusUpdateService,
  useNoticeStoreService,
  useNoticeUpdateService,
} from "./store-notices.service";
import { NoticeQueryOptions } from "./store-notices.type";

export const useNoticeQuery = (options: Partial<NoticeQueryOptions>) => {
  const { findAll } = useNoticeQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.NOTICE_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
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
    Notices: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useNoticeQueryById = (id: string) => {
  const { find } = useNoticeEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.NOTICE_EDIT, id],
    queryFn: () => find(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
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
    Notice: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useNoticeStoreMutation = () => {
  const router = useRouter();
  const { create } = useNoticeStoreService();
  return useMutation({
    mutationFn: (values: NoticeFormData) => create(values),
    mutationKey: [API_ENDPOINTS.NOTICE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.NoticeList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errors = data?.response?.data;
      if (errors?.seller_id?.[0]) {
        toast.error(errors.seller_id[0]);
      } else if (errors?.store_id?.[0]) {
        toast.error(errors.store_id[0]);
      }
    },
  });
};
export const useNoticeUpdateMutation = () => {
  const router = useRouter();
  const { create } = useNoticeUpdateService();
  return useMutation({
    mutationFn: (values: NoticeFormData) => create(values),
    mutationKey: [API_ENDPOINTS.NOTICE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.NoticeList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errors = data?.response?.data;
      if (errors?.seller_id?.[0]) {
        toast.error(errors.seller_id[0]);
      } else if (errors?.store_id?.[0]) {
        toast.error(errors.store_id[0]);
      }
    },
  });
};

export const useNoticeStatusUpdate = () => {
  const { create } = useNoticeStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.NOTICE_STATUS_CHANGE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useNoticeDelete = () => {
  const { create } = useNoticeDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.NOTICE_DELETE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
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
