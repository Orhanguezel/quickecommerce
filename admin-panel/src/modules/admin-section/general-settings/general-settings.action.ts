
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { GeneralSettingsFormData } from "./general-settings.schema";
import { useGeneralSettingsService } from "./general-settings.service";
import { GeneralSettingsQueryOptions } from "./general-settings.type";

// Hook for querying General Settings data
export const useGeneralSettingsQuery = (options: Partial<GeneralSettingsQueryOptions>) => {
  const { findAll } = useGeneralSettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.GENERAL_SETTINGS],
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

// Hook for creating a new brand
export const useGeneralSettingsStoreMutation = () => {
  const router = useRouter();
  const { create } = useGeneralSettingsService();

  return useMutation({
    mutationFn: (values: GeneralSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.GENERAL_SETTINGS],
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
