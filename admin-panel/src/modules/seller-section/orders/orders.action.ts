import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useCancelOrderService, useInvoiceService, useOrdersQueryService, useOrdersStatusUpdateService } from "./orders.service";
import { OrdersQueryOptions } from "./orders.type";
import { statusUpdateData } from "./orders.schema";

export const useOrdersQuery = (options: Partial<OrdersQueryOptions>) => {
  const { findAll } = useOrdersQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_ORDER_LIST],
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
    queryKey: [SELLER_API_ENDPOINTS.SELLER_ORDER_LIST, id],
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
    SellerOrderDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useInvoiceQuery = (options: Partial<OrdersQueryOptions>) => {
  const { findAll } = useInvoiceService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.SELLER_ORDER_INVOICE, options?.order_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
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

export const useCancelOrder = () => {
  const { create } = useCancelOrderService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_ORDER_CANCEL],
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



export const useOrdersStatusUpdate = () => {
  const { create } = useOrdersStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.SELLER_ORDER_STATUS_UPDATE],
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