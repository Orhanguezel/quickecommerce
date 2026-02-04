
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { CommissionSettingsFormData } from "./commission-settings.schema";
import { useCommissionSettingsService } from "./commission-settings.service";
import { CommissionSettingsQueryOptions } from "./commission-settings.type";
import { useEffect, useRef } from "react";

export const useCommissionSettingsQuery = (options: Partial<CommissionSettingsQueryOptions>) => {
  const { findAll } = useCommissionSettingsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.BUSINESS_OPERATION_COMMISSION_SETTINGS],
    queryFn: () => findAll(options),
    retry: false, // Disable retries
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
    commissionSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCommissionSettingsStoreMutation = () => {
  const router = useRouter();
  const { create } = useCommissionSettingsService();
  return useMutation({
    mutationFn: (values: CommissionSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.BUSINESS_OPERATION_COMMISSION_SETTINGS],
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