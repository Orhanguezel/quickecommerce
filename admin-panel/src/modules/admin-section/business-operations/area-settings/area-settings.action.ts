import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AreaSettingsFormData, areaSettingsStatusChange } from "./area-settings.schema";
import {
  useAreaSettingsAddService,
  useAreaSettingsDeleteService,
  useAreaSettingsEditService,
  useAreaSettingsService,
  useAreaSettingsStatusUpdateService,
  useAreaSettingsUpdateService
} from "./area-settings.service";
import { AreaSettingsQueryOptions } from "./area-settings.type";
import { useEffect, useRef } from "react";

export const useAreaSettingsQuery = (options: Partial<AreaSettingsQueryOptions>) => {
  const { findAll } = useAreaSettingsService();
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
    AreaSettingsList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useAreaSettingsQueryById = (id: string) => {
  const { find } = useAreaSettingsEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AREA_SETTINGS_EDIT, id],
    queryFn: () => find(id),
    enabled: !!id,
    retry: false, 
    refetchOnWindowFocus: false, 
  });
  return {
    AreaSettings: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAreaSettingsStoreMutation = () => {
  const { create } = useAreaSettingsAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: AreaSettingsFormData) => create(values),
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
export const useAreaSettingsUpdateMutation = () => {
  const { create } = useAreaSettingsUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: AreaSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.AREA_SETTINGS_UPDATE],
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

export const useAreaSettingsStatusChange = () => {
  const { create } = useAreaSettingsStatusUpdateService();
  return useMutation({
    mutationFn: (values: areaSettingsStatusChange) => create(values),
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
export const useAreaSettingsDelete = () => {
  const { delete: deleteItem } = useAreaSettingsDeleteService();
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
