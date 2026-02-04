import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { RefundReasonFormData, statusUpdateData } from "./refund-reason.schema";
import {
  useRefundReasonAddService,
  useRefundReasonDeleteService,
  useRefundReasonEditService,
  useRefundReasonQueryService,
  useRefundReasonStatusUpdateService,
  useRefundReasonUpdateService,
} from "./refund-reason.service";
import { RefundReasonQueryOptions } from "./refund-reason.type";
import { useRouter } from "next/navigation";
import { Routes } from "@/config/routes";

export const useRefundReasonQuery = (options: Partial<RefundReasonQueryOptions>) => {
  const { findAll } = useRefundReasonQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.REFUND_REASON_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
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
    RefundReasons: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useRefundReasonQueryById = (id: string) => {
  const { find } = useRefundReasonEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.REFUND_REASON_EDIT, id],
    queryFn: () => find(id),
    retry: false,
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
    RefundReason: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useRefundReasonStoreMutation = () => {
  const { create } = useRefundReasonAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: RefundReasonFormData) => create(values),
    mutationKey: [API_ENDPOINTS.REFUND_REASON_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.RefundReasonList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useRefundReasonUpdateMutation = () => {
  const { create } = useRefundReasonUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: RefundReasonFormData) => create(values),
    mutationKey: [API_ENDPOINTS.REFUND_REASON_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.RefundReasonList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useRefundReasonStatusUpdate = () => {
  const { create } = useRefundReasonStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.REFUND_REASON_STATUS_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useRefundReasonDelete = () => {
  const { delete: deleteItem } = useRefundReasonDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.REFUND_REASON_DELETE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
