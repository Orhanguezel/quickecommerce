import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { MethodFormData, statusUpdateData } from "./method.schema";
import {
  useMethodAddService,
  useMethodDeleteService,
  useMethodEditService,
  useMethodQueryService,
  useMethodStatusUpdateService,
  useMethodUpdateService,
} from "./method.service";
import { MethodQueryOptions } from "./method.type";
import { useRouter } from "next/navigation";
import { Routes } from "@/config/routes";


export const useMethodQuery = (options: Partial<MethodQueryOptions>) => {
  const { findAll } = useMethodQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.WITHDRAW_METHOD_LIST],
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
    Methods: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useMethodQueryById = (id: string) => {
  const { find } = useMethodEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.WITHDRAW_METHOD_EDIT, id],
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
    Method: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useMethodStoreMutation = () => {
  const { create } = useMethodAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: MethodFormData) => create(values),
    mutationKey: [API_ENDPOINTS.WITHDRAW_METHOD_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.MethodList);
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
export const useMethodUpdateMutation = () => {
  const { create } = useMethodUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: MethodFormData) => create(values),
    mutationKey: [API_ENDPOINTS.WITHDRAW_METHOD_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.MethodList);
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

export const useMethodStatusUpdate = () => {
  const { create } = useMethodStatusUpdateService();
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

export const useMethodDelete = () => {
  const { delete: deleteItem } = useMethodDeleteService();
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
