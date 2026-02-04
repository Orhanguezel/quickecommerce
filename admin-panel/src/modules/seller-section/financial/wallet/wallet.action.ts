"use client";

import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useBuyPackageService,
  useDepositService,
  useGenerateWalletHMACService,
  usePackageRenewService,
  useTransactionsQueryService,
  useWalletPaymentStatusUpdateService,
  useWalletQueryService,
} from "./wallet.service";
import { GenerateWalletHMACQueryOptions, WalletQueryOptions } from "./wallet.type";
import { setDynamicValue, setRefetch } from "@/redux/slices/refetchSlice";
import { useAppDispatch } from "@/redux/hooks";

export const useWalletQuery = (options: Partial<WalletQueryOptions>) => {
  const { findAll } = useWalletQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.WALLET_LIST, options?.store_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id,
  });
  useEffect(() => {
    //@ts-ignore
    const errorToast = error?.response?.data?.message;
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
    WalletDetails: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useTransactionsQuery = (options: Partial<WalletQueryOptions>) => {
  const { findAll } = useTransactionsQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.WALLET_TRANSACTIONS, options?.store_id],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!options?.store_id,
  });
  useEffect(() => {
    //@ts-ignore
    const errorToast = error?.response?.data?.message;
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
    TransactionsList: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useDepositMutation = () => {
  const { create }: any = useDepositService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.WALLET_AMOUNT_DEPOSIT],
    onSuccess: async (data) => {

    },
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

export const useWalletPaymentStatusMutation = (xHmac: string) => {
  const { create }: any = useWalletPaymentStatusUpdateService(xHmac);
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.WALLET_STATUS_UPDATE],
    onSuccess: async (data) => {
      dispatch(setRefetch(true));
      dispatch(setDynamicValue("paid"));
    },
    onError: async () => { },
  });
};

export const usePackageRenewMutation = () => {
  const { create }: any = usePackageRenewService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.PACKAGE_RENEW],
    onSuccess: async () => {
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};
export const useBuyPackageMutation = () => {
  const { create }: any = useBuyPackageService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.BUY_PACKAGE],
    onSuccess: async () => {

    },
    onError: async (data) => {
      // @ts-ignore
      const errorText = data?.response?.data;
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


export const useGenerateWalletHMAQuery = (
  options: Partial<GenerateWalletHMACQueryOptions>
) => {
  const { findAll } = useGenerateWalletHMACService();

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [SELLER_API_ENDPOINTS.GENERATE_WALLET_HMAC],
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