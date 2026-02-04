import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { statusUpdateData } from "./all-withdrawal.schema";
import {
  useAllWithdrawalDeleteService,
  useAllWithdrawalEditService,
  useAllWithdrawalQueryService,
  useAllWithdrawalStatusUpdateService
} from "./all-withdrawal.service";
import { AllWithdrawalQueryOptions } from "./all-withdrawal.type";


export const useAllWithdrawalQuery = (options: Partial<AllWithdrawalQueryOptions>) => {
  const { findAll } = useAllWithdrawalQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.WITHDRAW_LIST],
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
    AllWithdrawals: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useAllWithdrawalQueryById = (id: string) => {
  const { find } = useAllWithdrawalEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.WITHDRAW_DETAILS, id],
    queryFn: () => find(id),
    retry: false,
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
    WithdrawalDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// Hook for updating brand status
export const useAllWithdrawalStatusUpdate = () => {
  const { create } = useAllWithdrawalStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.WITHDRAW_METHOD_STATUS_CHANGE],
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

export const useAllWithdrawalDelete = () => {
  const { delete: deleteItem } = useAllWithdrawalDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.WITHDRAW_METHOD_DELETE],
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
