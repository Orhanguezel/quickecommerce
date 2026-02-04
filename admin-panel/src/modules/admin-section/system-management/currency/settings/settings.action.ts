import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  CurrencySettingsFormData,
  GetwaySettingsFormData,
} from "./settings.schema";
import {
  useCurrencySettingsService,
  useCurrencySettingsStoreService,
  usePaymentGetwayService,
  usePaymentGetwayUpdateService
} from "./settings.service";
import { PaymentSettingsQueryOptions } from "./settings.type";

export const usePaymentSettingsQuery = (
  options: Partial<PaymentSettingsQueryOptions>
) => {
  const { findAll } = useCurrencySettingsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CURRENCY_SETTINGS],
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
  const { update } = useCurrencySettingsStoreService();

  return useMutation({
    mutationFn: (values: CurrencySettingsFormData) => update(values),
    mutationKey: [API_ENDPOINTS.CURRENCY_SETTINGS_UPDATE],
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
