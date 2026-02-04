
import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { FooterCustomizationFormData } from "./footer-customization.schema";
import { useFooterCustomizationService } from "./footer-customization.service";
import { FooterCustomizationQueryOptions } from "./footer-customization.type";

export const useFooterCustomizationQuery = (options: Partial<FooterCustomizationQueryOptions>) => {
  const { findAll } = useFooterCustomizationService();
  
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.FOOTER_CUSTOMIZATION],
    queryFn: () => findAll(options),
    ...options,
  });
  return {
    footerCustomizationData: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

// Hook for creating a new brand
export const useFooterCustomizationStoreMutation = () => {
  const router = useRouter();
  const { create } = useFooterCustomizationService();

  return useMutation({
    mutationFn: (values: FooterCustomizationFormData) => create(values),
    mutationKey: [API_ENDPOINTS.FOOTER_CUSTOMIZATION],
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
