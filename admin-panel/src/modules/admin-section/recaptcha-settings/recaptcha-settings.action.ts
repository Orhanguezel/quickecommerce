
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { useRecaptchaSettingsService } from "./recaptcha-settings.service";
import { RecaptchaSettingsQueryOptions } from "./recaptcha-settings.type";
import { RecaptchaSettingsFormData } from "./recaptcha-settings.schema";

export const useRecaptchaSettingsQuery = (options: Partial<RecaptchaSettingsQueryOptions>) => {
  const { findAll } = useRecaptchaSettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.RECAPTCHA_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    recaptchaSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useRecaptchaSettingsStoreMutation = () => {

  const { create } = useRecaptchaSettingsService();

  return useMutation({
    mutationFn: (values: RecaptchaSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.RECAPTCHA_SETTINGS],
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


