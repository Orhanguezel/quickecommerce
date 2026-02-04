import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { StoreFormData } from "./store.schema";
import {
  useAdminStoreEditService,
  useAdminStoreQueryService,
  useAdminStoreService,
  useAdminStoreUpdateService,
  useStoreDashboardQueryService,
  useStoreDeleteService,
  useStoreStatusUpdateService,
  useSubscriptionPackagesQueryService,
  useTrashDeleteService,
  useTrashQueryService,
  useTrashRestoreService,
} from "./store.service";
import { StoreQueryOptions } from "./store.type";

export const useAdminStoreQuery = (options: Partial<StoreQueryOptions>) => {
  const { findAll } = useAdminStoreQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_STORE_LIST],
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
export const useStoreDashboardQuery = (options: Partial<StoreQueryOptions>) => {
  const { findAll } = useStoreDashboardQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.STORE_DASHBOARD],
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
    storeDashboard: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useStoreQueryById = (id: string) => {
  const { find } = useAdminStoreEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_STORE_EDIT, id],
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
    StoreById: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAdminStoreMutation = () => {
  const { create } = useAdminStoreService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: StoreFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_STORE_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.storeList);
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
export const useAdminStoreUpdateMutation = () => {
  const { create } = useAdminStoreUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: StoreFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_STORE_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.storeList);
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

export const useStoreStatusUpdateMutation = () => {
  const { patchItem } = useStoreStatusUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: StoreFormData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_STORE_STATUS_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.storeList);
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

export const useStoreDelete = () => {
  const { delete: deleteItem } = useStoreDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.ADMIN_STORE_DELETE],
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







export const useTrashStoreQuery = (options: Partial<StoreQueryOptions>) => {
  const { findAll } = useTrashQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.TRASH_STORE_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    TrashStoreList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useTrashStoreRestore = () => {
  const { create } = useTrashRestoreService();
   return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.TRASH_STORE_RESTORE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
         //@ts-ignore
        toast.success(data?.data?.message);
      } else {
        //@ts-ignore
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      toast.error(data?.response?.data?.errors.product_ids[0]);
    },
  });
};
export const useTrashStoreDelete = () => {
  const { create } = useTrashDeleteService();
   return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.TRASH_STORE_DELETE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
         //@ts-ignore
        toast.success(data?.data?.message);
      } else {
        //@ts-ignore
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      //@ts-ignore
      toast.error(data?.response?.data?.errors.product_ids[0]);
    },
  });
};