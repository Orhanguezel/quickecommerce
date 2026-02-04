import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { SellerFormData, statusUpdateData } from "./seller.schema";
import {
  useAdminSellerListService,
  useChangePasswordService,
  useSellerDeleteService,
  useSellerDetailsService,
  useSellerEditService,
  useSellerService,
  useSellerStatusUpdateService,
  useSellerStoreService,
  useSellerUpdateService,
  useTrashDeleteService,
  useTrashQueryService,
  useTrashRestoreService,
} from "./seller.service";
import { SellerQueryOptions } from "./seller.type";
import { useEffect, useRef } from "react";


export const useSellerQuery = (options: Partial<SellerQueryOptions>) => {
  const { findAll } = useSellerService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SELLER_LIST],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    sellerList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useAdminSellerListQuery = (
  options: Partial<SellerQueryOptions>
) => {
  const { findAll } = useAdminSellerListService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SELLER_LIST],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    AdminSellerList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSellerQueryById = (id: string) => {
  const { find } = useSellerEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SELLER_EDIT, id],
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
    Seller: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSellerDetailsById = (id: string) => {
  const { find } = useSellerDetailsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SELLER_DETAILS, id],
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
    SellerDetailsByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSellerStatusUpdate = () => {
  const { patchItem } = useSellerStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SELLER_STATUS_UPDATE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useSellerStoreMutation = () => {
  const router = useRouter();
  const { create } = useSellerStoreService();
  return useMutation({
    mutationFn: (values: SellerFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SELLER_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.SellerList);
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
  const router = useRouter();
  const { create } = useSellerUpdateService();
  return useMutation({
    mutationFn: (values: SellerFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SELLER_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.SellerList);
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

export const useSellerDelete = () => {
  const { create } = useSellerDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SELLER_REMOVE],
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

export const useChangePassword = () => {
  const { patchItem } = useChangePasswordService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SELLER_PASSWORD_CHANGE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
      } else {
        toast.error((data as any)?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.password[0]);
    },
  });
};









export const useTrashSellerQuery = (options: Partial<SellerQueryOptions>) => {
  const { findAll } = useTrashQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.TRASH_SELLER_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    TrashSellerList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useTrashSellerRestore = () => {
  const { create } = useTrashRestoreService();
   return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.TRASH_SELLER_RESTORE],
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
export const useTrashSellerDelete = () => {
  const { create } = useTrashDeleteService();
   return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.TRASH_SELLER_DELETE],
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
