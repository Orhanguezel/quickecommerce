
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { statusUpdateData } from "./refund-request.schema";
import {
  useRefundReasonQueryService,
  useRefundRequestQueryService,
  useRefundRequestStatusUpdateService
} from "./refund-request.service";
import { RefundRequestQueryOptions } from "./refund-request.type";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";


export const useRefundRequestQuery = (options: Partial<RefundRequestQueryOptions>) => {
  const { findAll } = useRefundRequestQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.REFUND_REQUEST_LIST, options?.store_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id
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
    RefundRequests: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useRefundRequestStatusUpdate = () => {
  const { create } = useRefundRequestStatusUpdateService();
  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.REFUND_REQUEST_STATUS_CHANGE],
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


export const useRefundReasonQuery = (options: Partial<RefundRequestQueryOptions>) => {
  const { findAll } = useRefundReasonQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.REFUND_REASON_LIST],
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
    RefundReasons: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

