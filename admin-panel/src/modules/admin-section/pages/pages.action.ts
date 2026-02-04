import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { PagesFormData } from "./pages.schema";
import {
  usePageAllService,
  usePageAddService,
  usePageUpdateService,
  usePageRemoveService,
  usePageService,
  useAllPagesService,
} from "./pages.service";
import { PagesQueryOptions } from "./pages.type";
import { useEffect, useRef } from "react";

export const useAllPagesQuery = (options: Partial<PagesQueryOptions>) => {
  const { findAll } = useAllPagesService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ALL_PAGES],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    AllPagesData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePagesQuery = (options: Partial<PagesQueryOptions>) => {
  const { findAll } = usePageAllService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PAGES],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    pagesData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePagesQueryById = (id: string) => {
  const { find } = usePageService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PAGES_GET, id],
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
    PageGetByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePageStoreMutation = () => {
  const { create } = usePageAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: PagesFormData) => create(values),
    mutationKey: [API_ENDPOINTS.PAGES_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.pages);
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
export const usePageUpdateMutation = () => {
  const { create } = usePageUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: PagesFormData) => create(values),
    mutationKey: [API_ENDPOINTS.PAGES_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.pages);
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
export const usePageDeleteMutation = () => {
  const { delete: deleteItem } = usePageRemoveService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.PAGES_REMOVE],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
