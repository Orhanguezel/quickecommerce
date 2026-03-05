import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  useSellerApplicationListService,
  useSellerApplicationDetailsService,
  useSellerApplicationApproveService,
  useSellerApplicationRejectService,
} from "./seller-application.service";
import { SellerApplicationQueryOptions } from "./seller-application.type";

export const useSellerApplicationListQuery = (
  options: Partial<SellerApplicationQueryOptions>
) => {
  const { findAll } = useSellerApplicationListService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SELLER_APPLICATION_LIST, options],
    queryFn: () => findAll(options),
  });

  return {
    applicationList: (data as any)?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSellerApplicationDetailsQuery = (id: string) => {
  const { find } = useSellerApplicationDetailsService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.ADMIN_SELLER_APPLICATION_DETAILS, id],
    queryFn: () => find(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  return {
    application: (data as any)?.data?.application ?? null,
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSellerApplicationApprove = () => {
  const { patchItem } = useSellerApplicationApproveService();
  return useMutation({
    mutationFn: (values: { id: string; admin_note?: string }) =>
      patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SELLER_APPLICATION_APPROVE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message || "Bir hata oluştu");
    },
  });
};

export const useSellerApplicationReject = () => {
  const { patchItem } = useSellerApplicationRejectService();
  return useMutation({
    mutationFn: (values: { id: string; admin_note: string }) =>
      patchItem(values),
    mutationKey: [API_ENDPOINTS.ADMIN_SELLER_APPLICATION_REJECT],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message || "Bir hata oluştu");
    },
  });
};
