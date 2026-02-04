
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { OpenAISettingsFormData } from "./openai-settings.schema";
import { useOpenAISettingsService } from "./openai-settings.service";
import { OpenAISettingsQueryOptions } from "./openai-settings.type";

// Hook for querying General Settings data
export const useOpenAISettingsQuery = (options: Partial<OpenAISettingsQueryOptions>) => {
  const { findAll } = useOpenAISettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.OPEN_AI_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    OpenAISettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// Hook for creating a new brand
export const useOpenAISettingsStoreMutation = () => {
  const router = useRouter();
  const { create } = useOpenAISettingsService();

  return useMutation({
    mutationFn: (values: OpenAISettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.OPEN_AI_SETTINGS],
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
