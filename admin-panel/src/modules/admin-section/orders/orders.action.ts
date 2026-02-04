import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { OrdersFormData, statusUpdateData } from "./orders.schema";
import {
  useCancelOrderService,
  useDeactivateExpiredFlashDealService,
  useDeliverymanAssignService,
  useDeliverymanListQueryService,
  useInvoiceService,
  useJoinRequestApproveService,
  useJoinRequestQueryService,
  useJoinRequestRejectService,
  useOrdersAllProductsQueryService,
  useOrdersDeleteService,
  useOrdersDropdownQueryService,
  useOrdersQueryService,
  useOrdersStatusUpdateService,
  useOrdersStoreService,
  useOrdersUpdateService,
  usePaymentStatusUpdateService,
} from "./orders.service";
import { OrdersQueryOptions } from "./orders.type";


export const useOrdersQuery = (options: Partial<OrdersQueryOptions>) => {
  const { findAll } = useOrdersQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ORDER_LIST],
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
    Orders: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useOrdersQueryById = (id: string) => {
  const { find } = useOrdersQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ORDER_LIST, id],
    queryFn: () => find(id),
    retry: false,
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
    OrderDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useInvoiceQuery = (options: Partial<OrdersQueryOptions>) => {
  const { findAll } = useInvoiceService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_ORDER_INVOICE, options?.order_id],
    queryFn: () => findAll(options),
    enabled: !!options?.order_id,
  });

  return {
    InvoiceList: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useOrdersDropdownQuery = (
  options: Partial<OrdersQueryOptions>
) => {
  const { findAll } = useOrdersDropdownQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.FLASH_DEALS_DROPDOWN_LIST],
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
    OrdersDropdown: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useOrdersAllProductsQuery = (
  options: Partial<OrdersQueryOptions>
) => {
  const { findAll } = useOrdersAllProductsQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.FLASH_DEALS_ALL_PRODUCTS_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
  return {
    OrdersAllProducts: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const useDeliverymanListQuery = (
  options: Partial<OrdersQueryOptions>
) => {
  const { findAll } = useDeliverymanListQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_DELIVERY_DROPDOWN_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
  return {
    DeliverymanList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useOrdersStatusUpdate = () => {
  const { patchItem  } = useOrdersStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem (values),
    mutationKey: [API_ENDPOINTS.ADMIN_ORDER_STATUS_UPDATE],
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
export const useOrdersPaymentStatusUpdate = () => {
  const { patchItem } = usePaymentStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_PAYMENT_STATUS_UPDATE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useDeliverymanAssign = () => {
  const { create } = useDeliverymanAssignService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_DELIVERY_ASSIGN],
    onSuccess: async () => {
      toast.success("Deliveryman assign successfully");
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useCancelOrder = () => {
  const { patchItem } = useCancelOrderService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_ORDER_CANCEL],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useOrdersStoreMutation = () => {
  const router = useRouter();
  const { create } = useOrdersStoreService();
  return useMutation({
    mutationFn: (values: OrdersFormData) => create(values),
    mutationKey: [API_ENDPOINTS.FLASH_DEALS_ADD],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.flashDealsList);
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
export const useOrdersUpdateMutation = () => {
  const router = useRouter();
  const { update } = useOrdersUpdateService();
  return useMutation({
    mutationFn: (values: OrdersFormData) => update(values),
    mutationKey: [API_ENDPOINTS.FLASH_DEALS_UPDATE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
        router.push(Routes.flashDealsList);
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

export const useOrdersDelete = () => {
  const { delete: deleteItem } = useOrdersDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.FLASH_DEALS_DELETE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useDeactivateExpiredFlashDealMutation = () => {
  const { postEmpty } = useDeactivateExpiredFlashDealService();

  return useMutation({
    mutationFn: () => postEmpty(),
    mutationKey: [API_ENDPOINTS.DEACTIVATE_EXPIRED_FLASH_SALE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
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
export const useJoinRequestQuery = (options: Partial<OrdersQueryOptions>) => {
  const { findAll } = useJoinRequestQueryService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.JOIN_REQUEST_LIST],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    JoinRequestData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useJoinRequestApproveMutation = () => {
  const { create } = useJoinRequestApproveService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.JOIN_REQUEST_APPROVE],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
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
export const useJoinRequestRejectMutation = () => {
  const { create } = useJoinRequestRejectService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.JOIN_REQUEST_REJECT],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
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
