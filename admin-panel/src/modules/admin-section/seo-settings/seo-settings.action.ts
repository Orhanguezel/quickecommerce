
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { SEOSettingsFormData } from "./seo-settings.schema";
import { useSEOSettingsService } from "./seo-settings.service";
import { SEOSettingsQueryOptions } from "./seo-settings.type";


export const useSEOSettingsQuery = (options: Partial<SEOSettingsQueryOptions>) => {
  const { findAll } = useSEOSettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SEO_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    seoSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSEOSettingsStoreMutation = () => {
 
  const { create } = useSEOSettingsService();

  return useMutation({
    mutationFn: (values: SEOSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.SEO_SETTINGS],
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