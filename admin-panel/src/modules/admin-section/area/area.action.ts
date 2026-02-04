import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AreaFormData, areaStatusChange } from "./area.schema";
import {
  useAreaAddService,
  useAreaDeleteService,
  useAreaEditService,
  useAreaService,
  useAreaStatusUpdateService,
  useAreaUpdateService
} from "./area.service";
import { AreaQueryOptions } from "./area.type";
import { useEffect, useRef } from "react";

export const useAreaQuery = (options: Partial<AreaQueryOptions>) => {
  const { findAll } = useAreaService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AREA_LIST],
    queryFn: () => findAll(options),
    retry: false, // Disable retries
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
    AreaList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useAreaQueryById = (id: string) => {
  const { find } = useAreaEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.AREA_EDIT, id],
    queryFn: () => find(id),
    enabled: !!id,
    retry: false, // Disable retries
    refetchOnWindowFocus: false, // Only run the query if `id` is provided
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
    Area: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAreaStoreMutation = () => {
  const { create } = useAreaAddService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: AreaFormData) => create(values),
    mutationKey: [API_ENDPOINTS.AREA_ADD],
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
export const useAreaUpdateMutation = () => {
  const { create } = useAreaUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: AreaFormData) => create(values),
    mutationKey: [API_ENDPOINTS.AREA_UPDATE],
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

export const useAreaStatusChange = () => {
  const { create } = useAreaStatusUpdateService();
  return useMutation({
    mutationFn: (values: areaStatusChange) => create(values),
    mutationKey: [API_ENDPOINTS.AREA_STATUS_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
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
export const useAreaDelete = () => {
  const { delete: deleteItem } = useAreaDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.AREA_DELETE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
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
