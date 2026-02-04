import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  CurrencySettingsFormData,
  GetwaySettingsFormData,
} from "./payment-settings.schema";
import {
  usePaymentSettingsService,
  usePaymentGetwayService,
  usePaymentGetwayUpdateService,
} from "./payment-settings.service";
import { PaymentSettingsQueryOptions } from "./payment-settings.type";
import { useEffect, useRef } from "react";

export const usePaymentSettingsQuery = (
  options: Partial<PaymentSettingsQueryOptions>
) => {
  const { findAll } = usePaymentSettingsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PAYMENT_GETWAY_CURRENCY],
    queryFn: () => findAll(options),
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
    paymentSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const usePaymentSettingsStoreMutation = () => {
  const { create } = usePaymentSettingsService();

  return useMutation({
    mutationFn: (values: CurrencySettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.PAYMENT_GETWAY_CURRENCY],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success((data as any)?.data?.message);
      } else {
        toast.error((data as any)?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const usePaymentGetwayQuery = (options: string) => {
  const { find } = usePaymentGetwayService(API_ENDPOINTS.PAYMENT_GETWAY);
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.PAYMENT_GETWAY + "/" + options],
    queryFn: () => find(options),
    retry: false,
    refetchOnWindowFocus: false,
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
    paymentgetway: data?.data.gateways ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};
export const usePaymentGetwayStoreMutation = (options: string) => {
  const { create } = usePaymentGetwayUpdateService(
    API_ENDPOINTS.PAYMENT_GETWAY + "/" + options
  );

  return useMutation({
    mutationFn: (values: GetwaySettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.PAYMENT_GETWAY + "/" + options],
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
