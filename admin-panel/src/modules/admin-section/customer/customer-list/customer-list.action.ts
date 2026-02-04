import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useChangePasswordService,
  useCustomerEmailVerifyService,
  useCustomerListDeleteService,
  useCustomerListEditService,
  useCustomerListQueryService,
  useCustomerListStatusUpdateService,
  useCustomerStoreService,
  useCustomerSuspendService,
  useCustomerUpdateService,
  useTrashDeleteService,
  useTrashQueryService,
  useTrashRestoreService,
} from "./customer-list.service";
import { CustomerListQueryOptions } from "./customer-list.type";
import { CustomerFormData, statusUpdateData } from "./customer-list.schema";
import { useRouter } from "next/navigation";
import { Routes } from "@/config/routes";

// Hook for Join Request action
export const useCustomerListQuery = (
  options: Partial<CustomerListQueryOptions>
) => {
  const { findAll } = useCustomerListQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_CUSTOMER_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    CustomerListData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCustomerListQueryById = (id: string) => {
  const { find } = useCustomerListEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_CUSTOMER_DETAILS, id],
    queryFn: () => find(id),
    retry: false,
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
    CustomerDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCustomerListStatusUpdate = () => {
  const { patchItem } = useCustomerListStatusUpdateService();
  return useMutation({
    mutationFn: (values: any) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_CUSTOMER_LIST_STATUS_CHANGE],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useCustomerStoreMutation = () => {
  const router = useRouter();
  const { create } = useCustomerStoreService();
  return useMutation({
    mutationFn: (values: CustomerFormData) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_CUSTOMER_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.CustomerList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data?.message;
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
export const useCustomerUpdateMutation = () => {
  const router = useRouter();
  const { update } = useCustomerUpdateService();
  return useMutation({
    mutationFn: (values: CustomerFormData) => update(values),
    mutationKey: [API_ENDPOINTS.ADMIN_CUSTOMER_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.CustomerList);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data?.message;
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
export const useCustomerEmailVerify = () => {
  const { patchItem } = useCustomerEmailVerifyService();
  return useMutation({
    mutationFn: (values: any) => patchItem(values),
    mutationKey: [API_ENDPOINTS.CUSTOMER_EMAIL_VERIFY],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useCustomerSuspend = () => {
  const { patchItem } = useCustomerSuspendService();
  return useMutation({
    mutationFn: (values: any) => patchItem(values),
    mutationKey: [API_ENDPOINTS.CUSTOMER_SUSPEND],
    onSuccess: async (data) => {
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useCustomerListDeleteMutation = () => {
  const { create } = useCustomerListDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.CUSTOMER_LIST_DELETE],
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

export const useChangePassword = () => {
  const { patchItem } = useChangePasswordService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.CUSTOMER_PASSWORD_CHANGE],
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
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useTrashCustomerQuery = (
  options: Partial<CustomerListQueryOptions>
) => {
  const { findAll } = useTrashQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.TRASH_CUSTOMER_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    TrashCustomerList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useTrashCustomerRestore = () => {
  const { create } = useTrashRestoreService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.TRASH_CUSTOMER_RESTORE],
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
export const useTrashCustomerDelete = () => {
  const { create } = useTrashDeleteService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.TRASH_CUSTOMER_DELETE],
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
