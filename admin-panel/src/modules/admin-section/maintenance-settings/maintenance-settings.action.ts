
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { MaintenanceSettingsFormData } from "./maintenance-settings.schema";
import { useMaintenanceSettingsService } from "./maintenance-settings.service";
import { MaintenanceSettingsQueryOptions } from "./maintenance-settings.type";

// Hook for querying General Settings data
export const useMaintenanceSettingsQuery = (options: Partial<MaintenanceSettingsQueryOptions>) => {
  const { findAll } = useMaintenanceSettingsService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.GENERAL_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    maintenanceSettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// Hook for creating a new brand
export const useMaintenanceSettingsStoreMutation = () => {
  const router = useRouter();
  const { create } = useMaintenanceSettingsService();

  return useMutation({
    mutationFn: (values: MaintenanceSettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.MAINTENANCE_SETTINGS],
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