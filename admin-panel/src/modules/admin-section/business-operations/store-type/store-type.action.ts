import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { StoreTypeFormData, storeTypeStatusChange } from "./store-type.schema";
import {
  useStoreTypeAddService,
  useStoreTypeDeleteService,
  useStoreTypeEditService,
  useStoreTypeService,
  useStoreTypeStatusUpdateService,
  useStoreTypeUpdateService
} from "./store-type.service";
import { StoreTypeQueryOptions } from "./store-type.type";
import { useEffect, useRef } from "react";

export const useStoreTypeQuery = (options: Partial<StoreTypeQueryOptions>) => {
  const { findAll } = useStoreTypeService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_STORE_TYPE_LIST],
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
    StoreTypeList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useStoreTypeQueryById = (id: string) => {
  const { find } = useStoreTypeEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.STORE_TYPE_EDIT, id],
    queryFn: () => find(id),
    enabled: !!id,
    retry: false, // Disable retries
    refetchOnWindowFocus: false, // Only run the query if `id` is provided
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
    StoreType: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useStoreTypeStoreMutation = () => {
  const { create } = useStoreTypeAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: StoreTypeFormData) => create(values),
    mutationKey: [API_ENDPOINTS.STORE_TYPE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.areaList);
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
export const useStoreTypeUpdateMutation = () => {
  const { create } = useStoreTypeUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: StoreTypeFormData) => create(values),
    mutationKey: [API_ENDPOINTS.STORE_TYPE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.storeTypeList);
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

export const useStoreTypeStatusChange = () => {
  const { create } = useStoreTypeStatusUpdateService();
  return useMutation({
    mutationFn: (values: storeTypeStatusChange) => create(values),
    mutationKey: [API_ENDPOINTS.STORE_TYPE_STATUS_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useStoreTypeDelete = () => {
  const { delete: deleteItem } = useStoreTypeDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.STORE_TYPE_DELETE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
