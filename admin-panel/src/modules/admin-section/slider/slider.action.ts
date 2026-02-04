import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { SliderFormData, statusUpdateData } from "./slider.schema";
import {
  useSliderDeleteService,
  useSliderEditService,
  useSliderQueryService,
  useSliderStatusUpdateService,
  useSliderStoreService,
  useSliderUpdateService,
} from "./slider.service";
import { SliderQueryOptions } from "./slider.type";

export const useSliderQuery = (options: Partial<SliderQueryOptions>) => {
  const { findAll } = useSliderQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SLIDER_LIST],
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
    Sliders: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSliderQueryById = (id: string) => {
  const { find } = useSliderEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SLIDER_EDIT, id],
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
    Slider: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSliderStoreMutation = () => {
  const router = useRouter();
  const { create } = useSliderStoreService();
  return useMutation({
    mutationFn: (values: SliderFormData) => create(values),
    mutationKey: [API_ENDPOINTS.SLIDER_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.SliderList);
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
export const useSliderUpdateMutation = () => {
  const router = useRouter();
  const { update } = useSliderUpdateService();
  return useMutation({
    mutationFn: (values: SliderFormData) => update(values),
    mutationKey: [API_ENDPOINTS.SLIDER_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.SliderList);
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

export const useSliderStatusUpdate = () => {
  const { patchItem } = useSliderStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.SLIDER_STATUS_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useSliderDelete = () => {
  const { delete: deleteItem } = useSliderDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.SLIDER_DELETE],
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
