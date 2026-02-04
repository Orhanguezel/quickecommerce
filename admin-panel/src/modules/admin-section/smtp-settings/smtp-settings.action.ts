
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { SMTPSettingsFormData } from "./smtp-settings.schema";
import { useSMTPSettingsService, useTestSMTPSettingsService } from "./smtp-settings.service";
import { SMTPSettingsQueryOptions } from "./smtp-settings.type";

export const useSMTPSettingsQuery = (options: Partial<SMTPSettingsQueryOptions>) => {
  const { findAll } = useSMTPSettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SMTP_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    smtpData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};


export const useSMTPSettingsStoreMutation = () => {

  const { create } = useSMTPSettingsService();

  return useMutation({
    mutationFn: (values: SMTPSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.SMTP_SETTINGS],
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

export const useTestSMTPSettingsQuery = (options: Partial<SMTPSettingsQueryOptions>) => {
  const { findAll } = useTestSMTPSettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SMTP_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    testSmtpData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useTestSMTPSettingsStoreMutation = () => {
  
  const { create } = useTestSMTPSettingsService();

  return useMutation({
    mutationFn: (values: SMTPSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.SMTP_SETTINGS],
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


