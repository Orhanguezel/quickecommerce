import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { TagFormData } from "./tag.schema";
import {
  useTagAllService,
  useTagAddService,
  useTagUpdateService,
  useTagRemoveService,
  useTagService,
} from "./tag.service";
import { TagQueryOptions } from "./tag.type";
import { useEffect, useRef } from "react";

export const useTagAllQuery = (options: Partial<TagQueryOptions>) => {
  const { findAll } = useTagAllService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.TAG],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    tags: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useTagQueryById = (id: string) => {
  const { find } = useTagService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.GET_TAG, id],
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
    GetTagByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useTagStoreMutation = () => {
  const { create } = useTagAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: TagFormData) => create(values),
    mutationKey: [API_ENDPOINTS.TAG_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.tags);
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
export const useTagUpdateMutation = () => {
  const { create } = useTagUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: TagFormData) => create(values),
    mutationKey: [API_ENDPOINTS.TAG_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.tags);
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


export const useTagDeleteMutation = () => {
  const { create } = useTagRemoveService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.TAG_REMOVE],
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
