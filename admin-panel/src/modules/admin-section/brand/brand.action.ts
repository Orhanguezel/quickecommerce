import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { BrandFormData, statusUpdateData } from "./brand.schema";
import {
  useBrandDeleteService,
  useBrandEditService,
  useBrandQueryService,
  useBrandStatusUpdateService,
  useBrandStoreService,
  useBrandUpdateService,
} from "./brand.service";
import { BrandQueryOptions } from "./brand.type";
import { useEffect, useRef } from "react";


export const useBrandsQuery = (options: Partial<BrandQueryOptions>) => {
  const { findAll } = useBrandQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_BRAND_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    brands: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useBrandQueryById = (id: string) => {
  const { find } = useBrandEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_BRAND_EDIT, id],
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
    BrandByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useBrandStoreMutation = () => {
  const router = useRouter();
  const { create } = useBrandStoreService();
  return useMutation({
    mutationFn: (values: BrandFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_BRAND_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.brand);
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
export const useBrandUpdateMutation = () => {
  const router = useRouter();
  const { update } = useBrandUpdateService();
  return useMutation({
    mutationFn: (values: BrandFormData) => update(values),
    mutationKey: [API_ENDPOINTS.ADMIN_BRAND_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.brand);
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

export const useBrandStatusUpdate = () => {
  const { patchItem } = useBrandStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_BRAND_STATUS],
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

export const useBrandDelete = () => {
  const { create } = useBrandDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_BRAND_REMOVE],
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
