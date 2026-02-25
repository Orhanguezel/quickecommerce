"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useBaseService } from "@/lib/base-service";
import { API_ENDPOINTS } from "@/endpoints/api-endpoints";
import type {
  WalletInfoResponse,
  WalletTransactionsResponse,
} from "./wallet.type";

export function useWalletInfoQuery() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.WALLET);

  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res =
        await getAxiosInstance().get<WalletInfoResponse>(API_ENDPOINTS.WALLET);
      return res.data;
    },
  });
}

export function useWalletTransactionsQuery(params: {
  page?: number;
  type?: string;
}) {
  const { getAxiosInstance } = useBaseService(
    API_ENDPOINTS.WALLET_TRANSACTIONS
  );

  return useQuery({
    queryKey: ["wallet-transactions", params],
    queryFn: async () => {
      const res = await getAxiosInstance().get<WalletTransactionsResponse>(
        API_ENDPOINTS.WALLET_TRANSACTIONS,
        {
          params: {
            page: params.page ?? 1,
            per_page: 15,
            ...(params.type && { type: params.type }),
          },
        }
      );
      return {
        transactions: res.data?.wallets ?? [],
        meta: res.data?.meta ?? {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
        },
      };
    },
  });
}

export function useWalletDepositMutation() {
  const { getAxiosInstance } = useBaseService(API_ENDPOINTS.WALLET_DEPOSIT);

  return useMutation({
    mutationFn: async (payload: {
      wallet_id: number;
      amount: number;
      payment_gateway: string;
      currency_code: string;
    }) => {
      const res = await getAxiosInstance().post<{
        message: string;
        wallet_history_id: number;
      }>(API_ENDPOINTS.WALLET_DEPOSIT, payload);
      return res.data;
    },
  });
}

export function useWalletStripeSessionMutation() {
  const { getAxiosInstance } = useBaseService(
    API_ENDPOINTS.WALLET_STRIPE_SESSION
  );

  return useMutation({
    mutationFn: async (payload: {
      wallet_id: number;
      wallet_history_id: number;
    }) => {
      const res = await getAxiosInstance().post<{
        success: boolean;
        data: { checkout_url: string; session_id: string };
      }>(API_ENDPOINTS.WALLET_STRIPE_SESSION, payload);
      return res.data;
    },
  });
}

export function useWalletIyzicoSessionMutation() {
  const { getAxiosInstance } = useBaseService(
    API_ENDPOINTS.WALLET_IYZICO_SESSION
  );

  return useMutation({
    mutationFn: async (payload: {
      wallet_id: number;
      wallet_history_id: number;
    }) => {
      const res = await getAxiosInstance().post<{
        success: boolean;
        data: { checkout_url: string; token: string; wallet_history_id: number };
      }>(API_ENDPOINTS.WALLET_IYZICO_SESSION, payload);
      return res.data;
    },
  });
}
