import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  useSiteMapSettingsService
} from "./sitemap-settings.service";


export const useSiteMapSettingsQuery = (options: Partial<any>) => {
  const { findAll } = useSiteMapSettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SITEMAP_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    SiteMapSettings: data?.data ?? [],
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// Hook for creating a new brand
export const useSiteMapSettingsStoreMutation = () => {
  const router = useRouter();
  const { create } = useSiteMapSettingsService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SITEMAP_SETTINGS],
    onSuccess: async (data) => {
      if (Boolean(data)) {
        toast.success(data?.data?.message);
      } 
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
