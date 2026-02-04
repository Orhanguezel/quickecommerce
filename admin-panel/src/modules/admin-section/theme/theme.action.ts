import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  useThemeAddService,
  useThemeAllService,
  useThemeDetailsService,
  useThemeStatusService,
} from "./theme.service";
import { TagQueryOptions } from "./theme.type";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

export const useThemeAllQuery = (options: Partial<TagQueryOptions>) => {
  const { findAll } = useThemeAllService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.THEMES_LIST],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    ThemeList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useThemeDetailsById = (id: any) => {
  const { find } = useThemeDetailsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.THEMES_DETAILS, id],
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
    ThemeDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useThemeStoreMutation = () => {
  const { create } = useThemeAddService();
  // const router = useRouter();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.THEMES_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        // router.push(Routes.pages);
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

export const useThemeStatus = () => {
  const { patchItem } = useThemeStatusService();
  return useMutation({
    mutationFn: (values: any) => patchItem(values),
    mutationKey: [API_ENDPOINTS.THEME_STATUS],
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
