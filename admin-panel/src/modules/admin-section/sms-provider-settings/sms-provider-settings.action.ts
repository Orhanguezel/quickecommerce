
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { useOtpLoginStatusUpdateService, useSmsProviderSettingsService, useSmsProviderSettingsUpdateService, useSmsProviderStatusUpdateService } from "./sms-provider-settings.service";
import { SMSProviderSettingsQueryOptions } from "./sms-provider-settings.type";

export const useSmsProviderSettingsList = (options: Partial<SMSProviderSettingsQueryOptions>) => {
  const { findAll } = useSmsProviderSettingsService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SMS_PROVIDER_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    SmsProviderSettingsList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSmsProviderStatusUpdate = () => {
  const { create } = useSmsProviderStatusUpdateService();

  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SMS_PROVIDER_STATUS_UPDATE],
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

export const useSmsProviderSettingsUpdate = () => {
  const { create } = useSmsProviderSettingsUpdateService();

  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SMS_PROVIDER_STATUS_UPDATE],
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

export const useOtpLoginStatusList = (options: Partial<SMSProviderSettingsQueryOptions>) => {
  const { findAll } = useOtpLoginStatusUpdateService();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_OTP_LOGIN_STATUS_UPDATE],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    OtpLoginStatusList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useOtpLoginStatusUpdate = () => {
  const { create } = useOtpLoginStatusUpdateService();

  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_OTP_LOGIN_STATUS_UPDATE],
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