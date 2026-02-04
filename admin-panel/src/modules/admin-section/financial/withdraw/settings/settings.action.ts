import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { WithdrawSettingsFormData } from "./settings.schema";
import { useWithdrawSettingsService } from "./settings.service";
import { WithdrawSettingsQueryOptions } from "./settings.type";

export const useWithdrawSettingsQuery = (
  options: Partial<WithdrawSettingsQueryOptions>
) => {
  const { findAll } = useWithdrawSettingsService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.WITHDRAW_SETTINGS],
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
    WithdrawSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useWithdrawSettingsStoreMutation = () => {
  const { create } = useWithdrawSettingsService();

  return useMutation({
    mutationFn: (values: WithdrawSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.WITHDRAW_SETTINGS],
    onSuccess: async (data) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data) => {
     //@ts-ignore
     const errorText = data?.response?.data
     toast.error(errorText?.message);
    },
  });
};
