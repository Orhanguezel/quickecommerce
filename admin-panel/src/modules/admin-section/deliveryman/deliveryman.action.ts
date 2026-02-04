import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { DeliverymanFormData, statusUpdateData } from "./deliveryman.schema";
import {
  useChangePasswordService,
  useDeliverymanApproveService,
  useDeliverymanDeleteService,
  useDeliverymanDetailsService,
  useDeliverymanEditService,
  useDeliverymanQueryService,
  useDeliverymanRequestQueryService,
  useDeliverymanStatusUpdateService,
  useDeliverymanStoreService,
  useDeliverymanUpdateService,
  useDeliverymanVerifyUpdateService,
  useTrashDeleteService,
  useTrashQueryService,
  useTrashRestoreService,
} from "./deliveryman.service";
import { DeliverymanQueryOptions } from "./deliveryman.type";

export const useDeliverymanQuery = (
  options: Partial<DeliverymanQueryOptions>
) => {
  const { findAll } = useDeliverymanQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DELIVERYMAN_LIST],
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
    Deliveryman: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useDeliverymanRequestQuery = (
  options: Partial<DeliverymanQueryOptions>
) => {
  const { findAll } = useDeliverymanRequestQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DELIVERYMAN_REQUEST_LIST],
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
    DeliverymanRequest: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useDeliverymanApproveMutation = () => {
  const { create } = useDeliverymanApproveService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.DELIVERYMAN_APPROVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
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


export const useDeliverymanQueryById = (id: string) => {
  const { find } = useDeliverymanEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DELIVERYMAN_EDIT, id],
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
    DeliverymanByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useDeliverymanDetailsById = (id: string) => {
  const { find } = useDeliverymanDetailsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.DELIVERYMAN_DETAILS, id],
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
    DeliverymanDetailsByID: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useDeliverymanStoreMutation = () => {
  const router = useRouter();
  const { create } = useDeliverymanStoreService();
  return useMutation({
    mutationFn: (values: DeliverymanFormData) => create(values),
    mutationKey: [API_ENDPOINTS.DELIVERYMAN_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.deliverymanList);
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
export const useDeliverymanUpdateMutation = () => {
  const router = useRouter();
  const { create } = useDeliverymanUpdateService();
  return useMutation({
    mutationFn: (values: DeliverymanFormData) => create(values),
    mutationKey: [API_ENDPOINTS.DELIVERYMAN_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.deliverymanList);
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

export const useDeliverymanStatusUpdate = () => {
  const { create } = useDeliverymanStatusUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: DeliverymanFormData) => create(values),
    mutationKey: [API_ENDPOINTS.DELIVERYMAN_STATUS_UPDATE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
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
export const useDeliverymanVerifyUpdate = () => {
  const { create } = useDeliverymanVerifyUpdateService();
  const router = useRouter();
  return useMutation({
    mutationFn: (values: DeliverymanFormData) => create(values),
    mutationKey: [API_ENDPOINTS.DELIVERYMAN_STATUS_VERIFY],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
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

export const useDeliverymanDelete = () => {
  const { delete: deleteItem } = useDeliverymanDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.DELIVERYMAN_REMOVE],
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

export const useChangePassword = () => {
  const { create } = useChangePasswordService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.DELIVERYMAN_PASSWORD_CHANGE],
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






export const useTrashDeliverymanQuery = (options: Partial<DeliverymanQueryOptions>) => {
  const { findAll } = useTrashQueryService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.TRASH_DELIVERYMAN_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    TrashDeliverymanList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useTrashDeliverymanRestore = () => {
  const { create } = useTrashRestoreService();
   return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.TRASH_DELIVERYMAN_RESTORE],
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
export const useTrashDeliverymanDelete = () => {
  const { create } = useTrashDeleteService();
   return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.TRASH_DELIVERYMAN_DELETE],
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
