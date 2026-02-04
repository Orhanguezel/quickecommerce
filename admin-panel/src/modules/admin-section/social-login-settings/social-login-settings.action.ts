
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { SocialLoginSettingsFormData } from "./social-login-settings.schema";
import { useSocialSettingsService } from "./social-login-settings.service";
import { SocialSettingsQueryOptions } from "./social-login-settings.type";

export const useSocialSettingsQuery = (options: Partial<SocialSettingsQueryOptions>) => {
  const { findAll } = useSocialSettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SOCIAL_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    generalSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSocialSettingsStoreMutation = () => {

  const { create } = useSocialSettingsService();

  return useMutation({
    mutationFn: (values: SocialLoginSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.SOCIAL_SETTINGS],
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


