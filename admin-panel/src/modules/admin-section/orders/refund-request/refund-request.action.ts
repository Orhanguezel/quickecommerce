import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  statusUpdateData,
  UpdateLiveLocationData,
} from "./refund-request.schema";
import {
  useRefundRequestQueryService,
  useRefundRequestStatusUpdateService,
  useUpdateLiveLocationService,
} from "./refund-request.service";
import { RefundRequestQueryOptions } from "./refund-request.type";

export const useRefundRequestQuery = (
  options: Partial<RefundRequestQueryOptions>
) => {
  const { findAll } = useRefundRequestQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.REFUND_REQUEST_LIST],
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
    mutationKey: [API_ENDPOINTS.REFUND_REQUEST_STATUS_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useUpdateLiveLocation = () => {
  const { create } = useUpdateLiveLocationService();

  return useMutation({
    mutationFn: (values: UpdateLiveLocationData) => create(values),
    mutationKey: [API_ENDPOINTS.UPDATE_LIVE_LOCATION],
    onSuccess: async () => {},
    onError: async () => {},
  });
};
