import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { SellerRoutes } from "@/config/sellerRoutes";
import { useEffect, useRef } from "react";
import { StoreFormData } from "./store.schema";
import {
  useSellerEditService,
  useSellerQueryService,
  useSellerStoreService,
  useSellerUpdateService,
  useStoreDashboardQueryService,
  useSubscriptionPackagesQueryService,
} from "./store.service";
import { StoreQueryOptions } from "./store.type";

export const useSellerStoreQuery = (options: Partial<StoreQueryOptions>) => {
  const { findAll } = useSellerQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_STORE_LIST],
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
    storeList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useSubscriptionPackagesStoreQuery = (
  options: Partial<StoreQueryOptions>
) => {
  const { findAll } = useSubscriptionPackagesQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SUBSCRIPTION_PACKAGE_LIST],
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
    PackageList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useStoreDashboardQuery = (slug: string) => {
  const { find } = useStoreDashboardQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.STORE_DASHBOARD, slug],
    queryFn: () => find(slug),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!slug,
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
    storeDashboard: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useStoreQueryById = (id: string) => {
  const { find } = useSellerEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_STORE_EDIT, id],
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
    StoreById: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSellerStoreMutation = () => {
  const { create } = useSellerStoreService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: StoreFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_STORE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.store);
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
export const useSellerUpdateMutation = () => {
  const { create } = useSellerUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: StoreFormData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_STORE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(SellerRoutes.store);
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
