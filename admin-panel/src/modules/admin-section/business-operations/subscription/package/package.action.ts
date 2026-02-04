import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { PackageFormData, packageStatusChange } from "./package.schema";
import {
  usePackageDeleteService,
  usePackageEditService,
  usePackageQueryService,
  usePackageStatusUpdateService,
  usePackageStoreService,
  usePackageUpdateService,
  useSubscriptionQueryService,
  useSubscriptionStoreHistoryService,
  useSubscriptionStoreStatusUpdateService
} from "./package.service";
import { PackageQueryOptions } from "./package.type";


export const usePackageQuery = (options: Partial<PackageQueryOptions>) => {
  const { findAll } = usePackageQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PACKAGE_LIST],
    queryFn: () => findAll(options),
    retry: false, // Disable retries
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
    PackageList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePackageQueryById = (id: string) => {
  const { find } = usePackageEditService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PACKAGE_EDIT, id],
    queryFn: () => find(id),
    enabled: !!id, // Only run the query if `id` is provided
  });

  return {
    Package: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// Hook for creating a new brand
export const usePackageStoreMutation = () => {
  const router = useRouter();
  const { create } = usePackageStoreService();
  return useMutation({
    mutationFn: (values: PackageFormData) => create(values),
    mutationKey: [API_ENDPOINTS.PACKAGE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.packageList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const usePackageUpdateMutation = () => {
  const router = useRouter();
  const { create } = usePackageUpdateService();
  return useMutation({
    mutationFn: (values: PackageFormData) => create(values),
    mutationKey: [API_ENDPOINTS.PACKAGE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.packageList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const usePackageStatusChange = () => {
  const { create } = usePackageStatusUpdateService();
  return useMutation({
    mutationFn: (values: packageStatusChange) => create(values),
    mutationKey: [API_ENDPOINTS.PACKAGE_STATUS_CHANGE],
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

export const usePackageDelete = () => {
  const { delete: deleteItem } = usePackageDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.PACKAGE_DELETE],
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

export const useSubscriptionStoreQuery = (options: Partial<PackageQueryOptions>) => {
  const { findAll } = useSubscriptionQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SUBSCRIPTION_STORE_LIST],
    queryFn: () => findAll(options),
    retry: false, // Disable retries
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
    SubscriptionStoreList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSubscriptionStoreHistoryQueryById = (id: string) => {
  const { find } = useSubscriptionStoreHistoryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SUBSCRIPTION_STORE_HISTORY, id],
    queryFn: () => find(id),
    enabled: !!id, // Only run the query if `id` is provided
  });

  return {
    SubscriptionStoreHistory: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};


export const useSubscriptionStoreStatusChange = () => {
  const { create } = useSubscriptionStoreStatusUpdateService();
  return useMutation({
    mutationFn: (values: packageStatusChange) => create(values),
    mutationKey: [API_ENDPOINTS.SUBSCRIPTION_STORE_STATUS_CHANGE],
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
