import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useBaseService } from "@/modules/core/base.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { LoyaltySettingsFormData } from "./loyalty-settings.schema";
import { useLoyaltySettingsService } from "./loyalty-settings.service";
import { LoyaltySettingsQueryOptions } from "./loyalty-settings.type";

export const useLoyaltySettingsQuery = (
  options: Partial<LoyaltySettingsQueryOptions>
) => {
  const { findAll } = useLoyaltySettingsService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.LOYALTY_SETTINGS],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    LoyaltySettingsData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useLoyaltySettingsStoreMutation = () => {
  const { create } = useLoyaltySettingsService();

  return useMutation({
    mutationFn: (values: LoyaltySettingsFormData) => create(values),
    mutationKey: [API_ENDPOINTS.LOYALTY_SETTINGS],
    onSuccess: async (data: any) => {
      if (Boolean(data?.data)) {
        toast.success(data?.data?.message);
      } else {
        toast.error(data?.data?.message);
      }
    },
    onError: async (data: any) => {
      toast.error(data?.response?.data?.message);
    },
  });
};

/** Puan ozeti: dagitilan/harcanan puan, acik yukumluluk, cekler. */
export const useLoyaltySummaryQuery = () => {
  const { findAll } = useBaseSummaryService();

  const { data, isPending, refetch } = useQuery({
    queryKey: [API_ENDPOINTS.LOYALTY_SUMMARY],
    queryFn: () => findAll({}),
  });

  return { summary: (data?.data as any)?.data ?? null, isPending, refetch };
};

const useBaseSummaryService = () =>
  useBaseService<any>(API_ENDPOINTS.LOYALTY_SUMMARY);
