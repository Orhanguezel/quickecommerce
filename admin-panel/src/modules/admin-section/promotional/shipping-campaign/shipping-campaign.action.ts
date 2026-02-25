import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { Routes } from "@/config/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ShippingCampaignFormData } from "./shipping-campaign.schema";
import {
  useShippingCampaignDeleteService,
  useShippingCampaignEditService,
  useShippingCampaignQueryService,
  useShippingCampaignStatusUpdateService,
  useShippingCampaignStoreService,
  useShippingCampaignUpdateService,
} from "./shipping-campaign.service";
import { ShippingCampaignQueryOptions } from "./shipping-campaign.type";
import { useEffect, useRef } from "react";

export const useShippingCampaignQuery = (
  options: Partial<ShippingCampaignQueryOptions>
) => {
  const { findAll } = useShippingCampaignQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.SHIPPING_CAMPAIGN_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
  useEffect(() => {
    const errorToast = (error as any)?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => { errorToastRef.current = null; },
      });
    }
  }, [error]);
  return {
    ShippingCampaigns: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useShippingCampaignQueryById = (id: string) => {
  const { find } = useShippingCampaignEditService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch } = useQuery({
    queryKey: [API_ENDPOINTS.SHIPPING_CAMPAIGN_EDIT, id],
    queryFn: () => find(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
  useEffect(() => {
    const errorToast = (error as any)?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => { errorToastRef.current = null; },
      });
    }
  }, [error]);
  return {
    ShippingCampaign: data?.data ?? {},
    error,
    isPending,
    refetch,
  };
};

export const useShippingCampaignStoreMutation = () => {
  const router = useRouter();
  const { create } = useShippingCampaignStoreService();
  return useMutation({
    mutationFn: (values: ShippingCampaignFormData) => create(values as any),
    mutationKey: [API_ENDPOINTS.SHIPPING_CAMPAIGN_ADD],
    onSuccess: async (data) => {
      if (Boolean((data as any)?.data)) {
        toast.success((data as any)?.data?.message);
        router.push(Routes.shippingCampaignList);
      } else {
        toast.error((data as any)?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useShippingCampaignUpdateMutation = () => {
  const router = useRouter();
  const { update } = useShippingCampaignUpdateService();
  return useMutation({
    mutationFn: (values: ShippingCampaignFormData) => update(values),
    mutationKey: [API_ENDPOINTS.SHIPPING_CAMPAIGN_UPDATE],
    onSuccess: async (data) => {
      if (Boolean((data as any)?.data)) {
        toast.success((data as any)?.data?.message);
        router.push(Routes.shippingCampaignList);
      } else {
        toast.error((data as any)?.data?.message);
      }
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useShippingCampaignStatusUpdate = () => {
  const { patchItem } = useShippingCampaignStatusUpdateService();
  return useMutation({
    mutationFn: (values: { id: string }) => patchItem(values),
    mutationKey: [API_ENDPOINTS.SHIPPING_CAMPAIGN_STATUS_UPDATE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};

export const useShippingCampaignDelete = () => {
  const { delete: deleteItem } = useShippingCampaignDeleteService();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    mutationKey: [API_ENDPOINTS.SHIPPING_CAMPAIGN_DELETE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
