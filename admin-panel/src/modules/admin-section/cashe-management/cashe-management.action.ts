
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { useCasheManagementService } from "./cashe-management.service";
import { CasheManagementQueryOptions } from "./cashe-management.type";

// Hook for querying General Settings data
export const useCasheManagementQuery = (options: Partial<CasheManagementQueryOptions>) => {
  const { findAll } = useCasheManagementService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.CASHE_MANAGEMENT],
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

// Hook for creating a new brand
export const useCasheManagementStoreMutation = () => {
  const { create } = useCasheManagementService();

  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.CASHE_MANAGEMENT],
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