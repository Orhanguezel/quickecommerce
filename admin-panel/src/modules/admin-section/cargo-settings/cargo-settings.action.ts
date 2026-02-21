import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useCargoSettingsService } from "./cargo-settings.service";

export const useCargoSettingsQuery = (options: Record<string, any> = {}) => {
  const { findAll } = useCargoSettingsService();

  const { data, isPending, error, refetch } = useQuery({
    queryKey: [API_ENDPOINTS.CARGO_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    cargoSettingsData: (data?.data as any)?.message ?? {},
    isPending,
    error,
    refetch,
  };
};

export const useCargoSettingsMutation = () => {
  const { create } = useCargoSettingsService();

  return useMutation({
    mutationFn: (values: Record<string, any>) => create(values),
    mutationKey: [API_ENDPOINTS.CARGO_SETTINGS],
    onSuccess: (data: any) => {
      if (data?.data) {
        toast.success(data.data.message || "Kaydedildi.");
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: (data: any) => {
      toast.error(data?.response?.data?.message || "Bir hata oluştu.");
    },
  });
};
