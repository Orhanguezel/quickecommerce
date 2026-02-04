"use client";

import { API_ENDPOINTS } from "@/endpoints/AdminApiEndPoints";
import { SELLER_API_ENDPOINTS } from "@/endpoints/SellerApiEndPoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useDepositService,
  usePaymentStatusUpdateService,
  useTransactionHistoryStatusUpdateService,
  useTransactionsQueryService,
  useWalletPaymentStatusUpdateService,
  useWalletQueryService,
  useWalletStatusUpdateService
} from "./wallet.service";
import { WalletQueryOptions } from "./wallet.type";
import { statusUpdateData } from "./wallet.schema";

export const useWalletQuery = (options: Partial<WalletQueryOptions>) => {
  const { findAll } = useWalletQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.WALLET_LIST],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
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
    allWallet: data?.data ?? {},
    error,
    isPending,
    refetch,
    isFetching,
  };
};

export const useWalletStatusChange = () => {
  const { create } = useWalletStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.WALLET_STATUS_UPDATE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
    },
    onError: async (data) => {
      //@ts-ignore
      const errorText = data?.response?.data;
      toast.error(errorText?.message);
    },
  });
};





export const useTransactionsQuery = (options: Partial<WalletQueryOptions>) => {
  const { findAll } = useTransactionsQueryService();
  const errorToastRef = useRef<string | null>(null);
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: [API_ENDPOINTS.WALLET_TRANSACTIONS],
    queryFn: () => findAll(options),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
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

export const useTransactionHistoryStatusChange = () => {
  const { create } = useTransactionHistoryStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.TRANSACTIONS_STATUS_UPDATE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
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
export const usePaymentStatusChange = () => {
  const { create } = usePaymentStatusUpdateService();

  return useMutation({
    mutationFn: (values: statusUpdateData) => create(values),
    mutationKey: [API_ENDPOINTS.TRANSACTIONS_PAYMENT_STATUS_UPDATE],
    onSuccess: async (data) => {
      //@ts-ignore
      toast.success(data?.data?.message);
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







export const useDepositMutation = () => {
  const { create }: any = useDepositService();
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [API_ENDPOINTS.WALLET_AMOUNT_DEPOSIT],
    onSuccess: async (data) => {
      //@ts-ignore
        toast.success(data?.data?.message);
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

export const useWalletPaymentStatusMutation = () => {
  const { create }: any = useWalletPaymentStatusUpdateService();
  const UserEmail = localStorage.getItem("user_email") || "";
  return useMutation({
    mutationFn: (values: any) => create(values),
    mutationKey: [SELLER_API_ENDPOINTS.WALLET_STATUS_UPDATE],
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
