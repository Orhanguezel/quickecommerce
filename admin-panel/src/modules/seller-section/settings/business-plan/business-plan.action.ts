"use client";

import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useBusinessPlanHistoryQueryService,
  useBusinessPlanQueryService,
  useBuyPackageService,
  useCommissionSettingsQueryService,
  useGenerateBusinessPlanHMACService,
  usePackageRenewService,
  usePaymentStatusUpdateService,
  useSubscriptionToCommissionService,
} from "./business-plan.service";
import { BusinessPlanQueryOptions, GenerateBusinessPlanHMACQueryOptions } from "./business-plan.type";

export const useBusinessPlanQuery = (
  options: Partial<BusinessPlanQueryOptions>
) => {
  const { findAll } = useBusinessPlanQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [
      SELLER_API_ENDPOINTS.BUSINESS_PLAN_DETAILS_LIST,
      options?.store_id,
    ],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id,
  });
  useEffect(() => {
    const errorToast = (error as any)?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => {
          errorToastRef.current = null;
        },
      });
    }
  }, [error]);
  return {
    BusinessPlanDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useCommissionSettingsQuery = (
  options: Partial<BusinessPlanQueryOptions>
) => {
  const { findAll } = useCommissionSettingsQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.COMMISSION_SETTINGS],
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
        onClose: () => {
          errorToastRef.current = null;
        },
      });
    }
  }, [error]);
  return {
    CommissionSettings: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useBusinessPlanHistoryQuery = (
  options: Partial<BusinessPlanQueryOptions>
) => {
  const { findAll } = useBusinessPlanHistoryQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [
      SELLER_API_ENDPOINTS.BUSINESS_PLAN_HISTORY_LIST,
      options?.store_id,
    ],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id,
  });
  useEffect(() => {
    const errorToast = (error as any)?.response?.data?.message;
    if (error && errorToast !== errorToastRef.current) {
      errorToastRef.current = errorToast;
      toast?.error(`${errorToast}`, {
        onClose: () => {
          errorToastRef.current = null;
        },
      });
    }
  }, [error]);
  return {
    BusinessPlanHistory: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useSubscriptionToCommissionMutation = () => {
  const { create }: any = useSubscriptionToCommissionService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.BUSINESS_PLAN_CHANGE],
    onSuccess: async (data) => {
      toast.success((data as any)?.data?.message);
    },
    onError: async (data) => {
      const status = (data as any)?.response?.status;
      const errorText = (data as any)?.response?.data;
      const showToast = (msg: string) => {
        if (status && [405].includes(status)) {
          toast.warning(msg);
        } else {
          toast.error(msg);
        }
      };

      if (errorText && typeof errorText === "object") {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            showToast(messages);
          }
        });
      } else {
        showToast(errorText?.message || "Something went wrong");
      }
    },
  });
};
export const usePaymentStatusMutation = (xHmac: string) => {
  const { create }: any = usePaymentStatusUpdateService(xHmac);
  const UserEmail = localStorage.getItem("user_email") || "";
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.PAYMENT_STATUS_UPDATE],
    onSuccess: async () => { },
    onError: async () => {
      if (!UserEmail || UserEmail === undefined) {
        //@ts-ignore
        const errorText = data?.response?.data;
        toast.error(errorText?.message);
      }
    },
  });
};
export const usePackageRenewMutation = () => {
  const { create }: any = usePackageRenewService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.PACKAGE_RENEW],
    onSuccess: async () => { },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      if (errorText && typeof errorText === "object") {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};
export const useBuyPackageMutation = () => {
  const { create }: any = useBuyPackageService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.BUY_PACKAGE],
    onSuccess: async () => { },
    onError: async (data) => {
      const errorText = (data as any)?.response?.data;
      if (errorText && typeof errorText === "object") {
        Object.entries(errorText).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(msg));
          } else if (typeof messages === "string") {
            toast.error(messages);
          }
        });
      } else {
        toast.error(errorText?.message);
      }
    },
  });
};


export const useGenerateBusinessPlanHMAQuery = (
  options: Partial<GenerateBusinessPlanHMACQueryOptions>
) => {
  const { findAll } = useGenerateBusinessPlanHMACService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.GENERATE_BUSINESS_PLAN_HMAC],
    queryFn: () => findAll(options),
    ...options,
  });

  return {
    generateHMAC: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};