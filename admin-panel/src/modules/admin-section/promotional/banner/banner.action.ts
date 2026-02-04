import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { BannerFormData, statusUpdateData } from "./banner.schema";
import {
  useBannerDeleteService,
  useBannerEditService,
  useBannerQueryService,
  useBannerStatusUpdateService,
  useBannerStoreService,
  useBannerUpdateService
} from "./banner.service";
import { BannerQueryOptions } from "./banner.type";


export const useBannerQuery = (
  options: Partial<BannerQueryOptions>
) => {
  const { findAll } = useBannerQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BANNER_LIST],
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
    Banners: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useBannerQueryById = (id: string) => {
  const { find } = useBannerEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BANNER_EDIT, id],
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
    Banner: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useBannerStoreMutation = () => {
  const router = useRouter();
  const { create } = useBannerStoreService();
  return useMutation({
    mutationFn: (values: BannerFormData) => create(values),
    mutationKey: [API_ENDPOINTS.BANNER_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        
        toast.success(data?.data?.message);
        router.push(Routes.BannerList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useBannerUpdateMutation = () => {
  const router = useRouter();
  const { update } = useBannerUpdateService();
  return useMutation({
    mutationFn: (values: BannerFormData) => update(values),
    mutationKey: [API_ENDPOINTS.BANNER_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.BannerList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useBannerStatusUpdate = () => {
  const { patchItem } = useBannerStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.BANNER_STATUS_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useBannerDelete = () => {
  const { delete: deleteItem } = useBannerDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.BANNER_DELETE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};


